export type CountryKey = 'nepal' | 'uk' | 'canada' | 'australia';

export type LicenseType = 'Bike' | 'Car' | 'Heavy Vehicle';

// "local" means the country-specific language text in JSON.
export type LangKey = 'en' | 'local';

export type LocalizedText = {
  en: string;
  local: string;
};

export type LocalizedOption = {
  id: string;
  en: string;
  local: string;
};

export type Question = {
  id: string;
  categoryId: string;
  licenseTypes: LicenseType[];
  question: LocalizedText;
  options: LocalizedOption[];
  correctOptionId: string;
  explanation: LocalizedText;
};

export type Category = {
  id: string;
  title: LocalizedText;
  icon?: string;
  sortOrder: number;
};

export type StudyMaterial = {
  id: string;
  categoryId: string;
  title: LocalizedText;
  body: LocalizedText;
  keyRules?: LocalizedText[];
  // If null/undefined, the UI should hide the image section.
  image?: {
    url: string;
    caption?: LocalizedText;
  };
};

export type MockTestConfig = {
  id: string;
  licenseType: LicenseType;
  // Used for both practice and timed mock exam screens.
  mode: 'mock';
  questionCount: number;
  timeSeconds: number;
  // Canada-only: used to select a province/region variant.
  regionKey?: string;
  // If omitted, we default to 50%.
  passMarkPercent?: number;
};

export type ReadingLink = {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  url: string;
};

export type CountryContent = {
  country: CountryKey;
  categories: Category[];
  studyMaterials: StudyMaterial[];
  /** Optional curated external reading (articles, gov pages, blogs) */
  readingLinks?: ReadingLink[];
  questions: Question[];
  mockTests: MockTestConfig[];
};

