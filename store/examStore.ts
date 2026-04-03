import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { auth } from '@/lib/firebase';
import { filterQuestions, getMockTestConfig, loadCountryContent } from '@/services/countryContent';
import { fetchAttemptHistory, upsertAttemptHistory } from '@/services/firestoreAttempts';
import type { Attempt } from '@/types/attempt';
import type { CountryKey, LangKey, LicenseType, Question } from '@/types/content';

function makeBookmarkKey(params: { country: CountryKey; licenseType: LicenseType; questionId: string }): string {
  return `${params.country}::${params.licenseType}::${params.questionId}`;
}

export type ActiveTest = {
  id: string;
  country: CountryKey;
  licenseType: LicenseType;
  regionKey?: string;
  mockTestId: string;
  passMarkPercent: number;
  questions: Question[];
  answers: Record<string, string>;
  startTime: number; // epoch ms
  initialTimeSeconds: number;
  timeLeftSeconds: number;
  isFinished: boolean;
  currentIndex: number;
};

interface ExamState {
  history: Attempt[];
  bookmarkedKeys: string[];
  lang: LangKey;
  activeTest: ActiveTest | null;

  toggleBookmark: (params: { country: CountryKey; licenseType: LicenseType; questionId: string }) => void;
  isBookmarked: (params: { country: CountryKey; licenseType: LicenseType; questionId: string }) => boolean;

  clearHistory: () => void;
  setLanguage: (lang: LangKey) => void;

  syncHistoryFromFirestore: () => Promise<void>;

  startTest: (params: { country: CountryKey; licenseType: LicenseType; regionKey?: string }) => Promise<void>;
  answerQuestion: (questionId: string, optionId: string) => void;
  submitTest: () => void;
  syncTimerNow: () => void;

  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  quitTest: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      history: [],
      bookmarkedKeys: [],
      lang: 'local',
      activeTest: null,

      toggleBookmark: (params) =>
        set((state) => {
          const key = makeBookmarkKey(params);
          const isIn = state.bookmarkedKeys.includes(key);
          return {
            bookmarkedKeys: isIn
              ? state.bookmarkedKeys.filter((k) => k !== key)
              : [...state.bookmarkedKeys, key],
          };
        }),

      isBookmarked: (params) => {
        const key = makeBookmarkKey(params);
        return get().bookmarkedKeys.includes(key);
      },

      clearHistory: () => set({ history: [] }),

      syncHistoryFromFirestore: async () => {
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) return;

          const remote = await fetchAttemptHistory(currentUser.uid);
          if (!remote.length) return;

          set((state) => {
            const existingIds = new Set(state.history.map((h) => h.id));
            const incoming = remote.filter((h) => !existingIds.has(h.id));
            const merged = [...incoming, ...state.history];
            merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
            return { history: merged };
          });
        } catch {
          // Best-effort sync only.
        }
      },

      setLanguage: (lang) => set({ lang }),

      startTest: async (params) => {
        const config = await getMockTestConfig(params);
        const content = await loadCountryContent(params.country);
        const pool = filterQuestions(content, params.licenseType);

        if (pool.length === 0) {
          throw new Error(`No questions available for ${params.country}/${params.licenseType}`);
        }

        // If the dataset is smaller than the required count, we cycle through it.
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const selected: Question[] = [];
        while (selected.length < config.questionCount) {
          for (const q of shuffled) {
            selected.push(q);
            if (selected.length >= config.questionCount) break;
          }
        }

        const initialTimeSeconds = config.timeSeconds;
        set({
          activeTest: {
            id: Date.now().toString(),
            country: params.country,
            licenseType: params.licenseType,
            regionKey: params.regionKey,
            mockTestId: config.id,
            passMarkPercent: config.passMarkPercent ?? 50,
            questions: selected,
            answers: {},
            startTime: Date.now(),
            initialTimeSeconds,
            timeLeftSeconds: initialTimeSeconds,
            isFinished: false,
            currentIndex: 0,
          },
        });
      },

      answerQuestion: (questionId, optionId) => {
        set((state) => {
          if (!state.activeTest || state.activeTest.isFinished) return state;
          return {
            activeTest: {
              ...state.activeTest,
              answers: {
                ...state.activeTest.answers,
                [questionId]: optionId,
              },
            },
          };
        });
      },

      syncTimerNow: () => {
        const state = get();
        if (!state.activeTest || state.activeTest.isFinished) return;
        const elapsedSeconds = Math.floor((Date.now() - state.activeTest.startTime) / 1000);
        const remaining = Math.max(0, state.activeTest.initialTimeSeconds - elapsedSeconds);

        set((s) => ({
          activeTest: s.activeTest
            ? {
                ...s.activeTest,
                timeLeftSeconds: remaining,
              }
            : null,
        }));

        if (remaining <= 0) {
          get().submitTest();
        }
      },

      submitTest: () => {
        const state = get();
        if (!state.activeTest || state.activeTest.isFinished) return;

        const active = state.activeTest;
        const totalQuestions = active.questions.length;

        let score = 0;
        const statsByCategory: Record<string, { correct: number; total: number }> = {};

        for (const q of active.questions) {
          const given = active.answers[q.id];
          const isCorrect = given === q.correctOptionId;
          if (isCorrect) score++;

          const stat = (statsByCategory[q.categoryId] ??= { correct: 0, total: 0 });
          stat.total += 1;
          if (isCorrect) stat.correct += 1;
        }

        const accuracyPercent = Math.round((score / Math.max(1, totalQuestions)) * 100);
        const passThreshold = Math.ceil((active.passMarkPercent / 100) * totalQuestions);
        const passed = score >= passThreshold;

        const categoryStats: Attempt['categoryStats'] = Object.entries(statsByCategory)
          .map(([categoryId, v]) => ({
            categoryId,
            correct: v.correct,
            total: v.total,
          }))
          .sort((a, b) => (a.total === b.total ? a.correct - b.correct : b.total - a.total));

        const userId = auth.currentUser?.uid ?? 'local-user';

        const result: Attempt = {
          id: Date.now().toString(),
          userId,
          country: active.country,
          licenseType: active.licenseType,
          createdAt: new Date().toISOString(),
          mode: 'mock',
          score,
          totalQuestions,
          accuracyPercent,
          passed,
          categoryStats,
        };

        set((s) => ({
          history: [result, ...s.history],
          activeTest: s.activeTest ? { ...s.activeTest, isFinished: true, timeLeftSeconds: 0 } : null,
        }));

        // Firestore persistence is best-effort. App remains fully usable offline.
        upsertAttemptHistory(result).catch(() => {});
      },

      nextQuestion: () => {
        set((state) => {
          if (!state.activeTest) return state;
          const nextIndex = Math.min(state.activeTest.currentIndex + 1, state.activeTest.questions.length - 1);
          return {
            activeTest: { ...state.activeTest, currentIndex: nextIndex },
          };
        });
      },

      prevQuestion: () => {
        set((state) => {
          if (!state.activeTest) return state;
          const prevIndex = Math.max(state.activeTest.currentIndex - 1, 0);
          return {
            activeTest: { ...state.activeTest, currentIndex: prevIndex },
          };
        });
      },

      tickTimer: () => {
        const state = get();
        if (!state.activeTest || state.activeTest.isFinished) return;

        const elapsedSeconds = Math.floor((Date.now() - state.activeTest.startTime) / 1000);
        const remaining = Math.max(0, state.activeTest.initialTimeSeconds - elapsedSeconds);

        if (remaining <= 0) {
          set((s) => ({
            activeTest: s.activeTest ? { ...s.activeTest, timeLeftSeconds: 0 } : null,
          }));
          get().submitTest();
          return;
        }

        set((s) => ({
          activeTest: s.activeTest ? { ...s.activeTest, timeLeftSeconds: remaining } : null,
        }));
      },

      quitTest: () => set({ activeTest: null }),
    }),
    {
      name: 'sawarichalak-exam-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
        bookmarkedKeys: state.bookmarkedKeys,
        lang: state.lang,
        activeTest: state.activeTest,
      }),
    },
  ),
);
