import { create } from 'zustand';

import type { CountryKey, LicenseType, Question } from '@/types/content';
import { filterQuestions, loadCountryContent } from '@/services/countryContent';

export type FlashcardSession = {
  id: string;
  country: CountryKey;
  licenseType: LicenseType;
  categoryId?: string;
  questions: Question[];
  currentIndex: number;
  /** Front = question; back = correct answer + short explanation */
  showBack: boolean;
};

interface FlashcardState {
  session: FlashcardSession | null;
  start: (params: { country: CountryKey; licenseType: LicenseType; categoryId?: string; cardCount?: number }) => Promise<void>;
  flip: () => void;
  next: () => void;
  prev: () => void;
  quit: () => void;
}

function pickQuestions(pool: Question[], count: number): Question[] {
  if (pool.length === 0) return [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const out: Question[] = [];
  while (out.length < count) {
    for (const q of shuffled) {
      out.push(q);
      if (out.length >= count) break;
    }
  }
  return out;
}

const DEFAULT_COUNT = 20;

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  session: null,

  start: async (params) => {
    const content = await loadCountryContent(params.country);
    const pool = filterQuestions(content, params.licenseType, params.categoryId);
    const count = params.cardCount ?? DEFAULT_COUNT;
    const questions = pickQuestions(pool, Math.min(count, Math.max(pool.length, 1)));
    if (questions.length === 0) {
      throw new Error(`No questions available for flashcards (${params.country}/${params.licenseType})`);
    }
    set({
      session: {
        id: Date.now().toString(),
        country: params.country,
        licenseType: params.licenseType,
        categoryId: params.categoryId,
        questions,
        currentIndex: 0,
        showBack: false,
      },
    });
  },

  flip: () => {
    const s = get().session;
    if (!s) return;
    set({ session: { ...s, showBack: !s.showBack } });
  },

  next: () => {
    const s = get().session;
    if (!s) return;
    const nextIndex = Math.min(s.currentIndex + 1, s.questions.length - 1);
    set({ session: { ...s, currentIndex: nextIndex, showBack: false } });
  },

  prev: () => {
    const s = get().session;
    if (!s) return;
    const prevIndex = Math.max(s.currentIndex - 1, 0);
    set({ session: { ...s, currentIndex: prevIndex, showBack: false } });
  },

  quit: () => set({ session: null }),
}));
