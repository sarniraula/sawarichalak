import type { CountryKey, LicenseType, LocalizedOption, LocalizedText } from './content';

export type CategoryStat = {
  categoryId: string;
  correct: number;
  total: number;
};

export type AttemptReviewItem = {
  questionId: string;
  categoryId: string;
  question: LocalizedText;
  options: LocalizedOption[];
  correctOptionId: string;
  /** User's selected option id, if any */
  userAnswerId?: string;
};

export type AttemptBase = {
  id: string;
  userId: string;
  country: CountryKey;
  licenseType: LicenseType;
  createdAt: string; // ISO
  mode: 'mock' | 'practice';
};

export type Attempt = AttemptBase & {
  score: number;
  totalQuestions: number;
  accuracyPercent: number;
  passed?: boolean; // for mock exams
  categoryStats: CategoryStat[];
  /** Full question snapshots + answers for post-exam review */
  reviewItems?: AttemptReviewItem[];
};

export type ActiveTimedAttempt = Omit<Attempt, 'score' | 'accuracyPercent' | 'passed'> & {
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, string>;
  startTime: number; // epoch ms
  timeLeftSeconds: number;
  finished: boolean;
};

