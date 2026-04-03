import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CountryKey, LicenseType, Question } from '@/types/content';
import { filterQuestions, loadCountryContent } from '@/services/countryContent';

const DEFAULT_PRACTICE_QUESTION_COUNT = 20;

export type ActivePracticeSession = {
  id: string;
  country: CountryKey;
  licenseType: LicenseType;
  categoryId?: string;
  questions: Question[];
  answers: Record<string, string>;
  revealed: Record<string, boolean>;
  currentIndex: number;
  startedAt: number;
  isFinished: boolean;
};

interface QuizState {
  session: ActivePracticeSession | null;
  startPractice: (params: {
    country: CountryKey;
    licenseType: LicenseType;
    categoryId?: string;
    questionCount?: number;
  }) => Promise<void>;
  selectOption: (params: { questionId: string; optionId: string }) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finish: () => void;
  quit: () => void;
}

function pickQuestions(pool: Question[], count: number): Question[] {
  if (pool.length === 0) return [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected: Question[] = [];
  while (selected.length < count) {
    for (const q of shuffled) {
      selected.push(q);
      if (selected.length >= count) break;
    }
  }
  return selected;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      session: null,

      startPractice: async (params) => {
        const content = await loadCountryContent(params.country);
        const pool = filterQuestions(content, params.licenseType, params.categoryId);
        const questions = pickQuestions(pool, params.questionCount ?? DEFAULT_PRACTICE_QUESTION_COUNT);

        if (questions.length === 0) {
          throw new Error(`No practice questions available for ${params.country}/${params.licenseType}`);
        }

        set({
          session: {
            id: Date.now().toString(),
            country: params.country,
            licenseType: params.licenseType,
            categoryId: params.categoryId,
            questions,
            answers: {},
            revealed: {},
            currentIndex: 0,
            startedAt: Date.now(),
            isFinished: false,
          },
        });
      },

      selectOption: ({ questionId, optionId }) => {
        set((state) => {
          if (!state.session || state.session.isFinished) return state;
          return {
            session: {
              ...state.session,
              answers: { ...state.session.answers, [questionId]: optionId },
              revealed: { ...state.session.revealed, [questionId]: true },
            },
          };
        });
      },

      nextQuestion: () => {
        set((state) => {
          if (!state.session) return state;
          const nextIndex = Math.min(state.session.currentIndex + 1, state.session.questions.length - 1);
          return { session: { ...state.session, currentIndex: nextIndex } };
        });
      },

      prevQuestion: () => {
        set((state) => {
          if (!state.session) return state;
          const prevIndex = Math.max(state.session.currentIndex - 1, 0);
          return { session: { ...state.session, currentIndex: prevIndex } };
        });
      },

      finish: () => {
        set((state) => {
          if (!state.session) return state;
          return { session: { ...state.session, isFinished: true } };
        });
      },

      quit: () => set({ session: null }),
    }),
    {
      name: 'sawarichalak-quiz-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session }),
    },
  ),
);

