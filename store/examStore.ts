import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TestResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
}

interface ExamState {
  history: TestResult[];
  bookmarkedIds: string[];
  addTestResult: (result: TestResult) => void;
  toggleBookmark: (id: string) => void;
  clearHistory: () => void;
  language: 'en' | 'np';
  setLanguage: (lang: 'en' | 'np') => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      history: [],
      bookmarkedIds: [],
      language: 'np', // default to nepali
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
    }),
    {
      name: 'sawarichalak-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
