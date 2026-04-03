import type { CountryKey, LicenseType } from './content';

export type CategoryStat = {
  categoryId: string;
  correct: number;
  total: number;
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
};

export type ActiveTimedAttempt = Omit<Attempt, 'score' | 'accuracyPercent' | 'passed'> & {
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, string>;
  startTime: number; // epoch ms
  timeLeftSeconds: number;
  finished: boolean;
};

