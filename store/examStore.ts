import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questionsData from '@/data/questions.json';

export interface Question {
  id: string;
  category: string;
  question: { en: string; np: string };
  options: { id: string; en: string; np: string }[];
  correctOptionId: string;
  weightage: string;
}

export interface TestResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
}

export interface ActiveTest {
  questions: Question[];
  answers: Record<string, string>;
  startTime: number;
  timeLeft: number;
  isFinished: boolean;
  currentIndex: number;
}

interface ExamState {
  history: TestResult[];
  bookmarkedIds: string[];
  language: 'en' | 'np';
  activeTest: ActiveTest | null;

  addTestResult: (result: TestResult) => void;
  toggleBookmark: (id: string) => void;
  clearHistory: () => void;
  setLanguage: (lang: 'en' | 'np') => void;

  startTest: () => void;
  answerQuestion: (questionId: string, optionId: string) => void;
  submitTest: () => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  quitTest: () => void;
}

// 30 minutes in seconds
const TEST_DURATION = 30 * 60;
const PASSING_SCORE = 10;
const TOTAL_QUESTIONS = 20;

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      history: [],
      bookmarkedIds: [],
      language: 'np',
      activeTest: null,

      addTestResult: (result) => 
        set((state) => ({ history: [result, ...state.history] })),
      
      toggleBookmark: (id) =>
        set((state) => ({
          bookmarkedIds: state.bookmarkedIds.includes(id)
            ? state.bookmarkedIds.filter((bId) => bId !== id)
            : [...state.bookmarkedIds, id],
        })),
        
      clearHistory: () => set({ history: [] }),
      
      setLanguage: (lang) => set({ language: lang }),

      startTest: () => {
        // Randomly select configured amount of questions
        const shuffled = [...(questionsData as Question[])].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, TOTAL_QUESTIONS);
        
        set({
          activeTest: {
            questions: selected,
            answers: {},
            startTime: Date.now(),
            timeLeft: TEST_DURATION,
            isFinished: false,
            currentIndex: 0,
          }
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
              }
            }
          };
        });
      },

      submitTest: () => {
        const state = get();
        if (!state.activeTest || state.activeTest.isFinished) return;

        let score = 0;
        state.activeTest.questions.forEach((q) => {
          if (state.activeTest!.answers[q.id] === q.correctOptionId) {
            score++;
          }
        });

        const result: TestResult = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          score,
          totalQuestions: TOTAL_QUESTIONS,
          passed: score >= PASSING_SCORE,
        };

        set((state) => ({
          history: [result, ...state.history],
          activeTest: state.activeTest ? { ...state.activeTest, isFinished: true } : null,
        }));
      },

      nextQuestion: () => {
        set((state) => {
          if (!state.activeTest) return state;
          const nextIndex = Math.min(
            state.activeTest.currentIndex + 1, 
            state.activeTest.questions.length - 1
          );
          return {
            activeTest: { ...state.activeTest, currentIndex: nextIndex }
          };
        });
      },

      prevQuestion: () => {
        set((state) => {
          if (!state.activeTest) return state;
          const prevIndex = Math.max(state.activeTest.currentIndex - 1, 0);
          return {
            activeTest: { ...state.activeTest, currentIndex: prevIndex }
          };
        });
      },

      tickTimer: () => {
        const state = get();
        if (!state.activeTest || state.activeTest.isFinished) return;
        
        if (state.activeTest.timeLeft <= 1) {
          // Time is up, auto submit
          get().submitTest();
        } else {
          set((state) => ({
            activeTest: state.activeTest 
              ? { ...state.activeTest, timeLeft: state.activeTest.timeLeft - 1 } 
              : null
          }));
        }
      },

      quitTest: () => set({ activeTest: null }),
    }),
    {
      name: 'sawarichalak-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        history: state.history, 
        bookmarkedIds: state.bookmarkedIds, 
        language: state.language 
        // We do NOT persist activeTest, so if app closes, test is abandoned.
      }),
    }
  )
);
