import type {
  Category,
  CountryContent,
  CountryKey,
  LicenseType,
  MockTestConfig,
  Question,
  ReadingLink,
  StudyMaterial,
} from '@/types/content';
import { readJson, writeJson } from '@/services/offlineCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

import nepalCategories from '@/countries/nepal/categories.json';
import nepalStudyMaterials from '@/countries/nepal/studyMaterials.json';
import { nepalQuestionsData } from '@/countries/nepal/questionsData';
import nepalMockTests from '@/countries/nepal/mockTests.json';
import nepalReadingLinks from '@/countries/nepal/readingLinks.json';

import ukCategories from '@/countries/uk/categories.json';
import ukStudyMaterials from '@/countries/uk/studyMaterials.json';
import ukQuestions from '@/countries/uk/questions.json';
import ukMockTests from '@/countries/uk/mockTests.json';

import canadaCategories from '@/countries/canada/categories.json';
import canadaStudyMaterials from '@/countries/canada/studyMaterials.json';
import canadaQuestions from '@/countries/canada/questions.json';
import canadaMockTests from '@/countries/canada/mockTests.json';

import australiaCategories from '@/countries/australia/categories.json';
import australiaStudyMaterials from '@/countries/australia/studyMaterials.json';
import australiaQuestions from '@/countries/australia/questions.json';
import australiaMockTests from '@/countries/australia/mockTests.json';

const COUNTRY_MODULES: Record<
  CountryKey,
  {
    categories: Category[];
    studyMaterials: StudyMaterial[];
    readingLinks?: ReadingLink[];
    questions: Question[];
    mockTests: MockTestConfig[];
  }
> = {
  nepal: {
    categories: nepalCategories as any,
    studyMaterials: nepalStudyMaterials as any,
    readingLinks: nepalReadingLinks as any,
    questions: nepalQuestionsData as any,
    mockTests: nepalMockTests as any,
  },
  uk: {
    categories: ukCategories as any,
    studyMaterials: ukStudyMaterials as any,
    questions: ukQuestions as any,
    mockTests: ukMockTests as any,
  },
  canada: {
    categories: canadaCategories as any,
    studyMaterials: canadaStudyMaterials as any,
    questions: canadaQuestions as any,
    mockTests: canadaMockTests as any,
  },
  australia: {
    categories: australiaCategories as any,
    studyMaterials: australiaStudyMaterials as any,
    questions: australiaQuestions as any,
    mockTests: australiaMockTests as any,
  },
};

const CACHE_PREFIX = 'countryContent:v2:';

function validateMinimal(content: any, country: CountryKey): content is CountryContent {
  return (
    content &&
    content.country === country &&
    Array.isArray(content.categories) &&
    Array.isArray(content.questions) &&
    Array.isArray(content.mockTests)
  );
}

export async function loadCountryContent(country: CountryKey): Promise<CountryContent> {
  const cacheKey = `${CACHE_PREFIX}${country}`;
  const cached = await readJson<CountryContent>(cacheKey);
  if (cached && validateMinimal(cached, country)) return cached;

  const modules = COUNTRY_MODULES[country];
  const fresh: CountryContent = {
    country,
    categories: modules.categories,
    studyMaterials: modules.studyMaterials,
    ...(modules.readingLinks ? { readingLinks: modules.readingLinks } : {}),
    questions: modules.questions,
    mockTests: modules.mockTests,
  };

  await writeJson(cacheKey, fresh);
  return fresh;
}

export async function prewarmAllCountries(): Promise<void> {
  // Best-effort preloading so first run feels fast even when storage is empty.
  await Promise.all(
    (Object.keys(COUNTRY_MODULES) as CountryKey[]).map(async (c) => {
      const cacheKey = `${CACHE_PREFIX}${c}`;
      const cached = await readJson<CountryContent>(cacheKey);
      if (cached && validateMinimal(cached, c)) return;
      await writeJson(cacheKey, {
        country: c,
        categories: COUNTRY_MODULES[c].categories,
        studyMaterials: COUNTRY_MODULES[c].studyMaterials,
        ...(COUNTRY_MODULES[c].readingLinks ? { readingLinks: COUNTRY_MODULES[c].readingLinks } : {}),
        questions: COUNTRY_MODULES[c].questions,
        mockTests: COUNTRY_MODULES[c].mockTests,
      });
    }),
  );
}

export function filterQuestions(
  content: CountryContent,
  licenseType: LicenseType,
  categoryId?: string,
): Question[] {
  const byLicense = content.questions.filter((q) => q.licenseTypes.includes(licenseType));
  if (!categoryId) return byLicense;
  return byLicense.filter((q) => q.categoryId === categoryId);
}

export async function getMockTestConfig(params: {
  country: CountryKey;
  licenseType: LicenseType;
  regionKey?: string;
}): Promise<MockTestConfig> {
  const content = await loadCountryContent(params.country);

  const candidates = content.mockTests.filter((t) => t.licenseType === params.licenseType && t.mode === 'mock');
  if (params.country === 'canada') {
    const regionCandidates = candidates.filter((t) => t.regionKey === params.regionKey);
    if (regionCandidates.length > 0) return regionCandidates[0];
  }

  // Fallback: first match for the license type.
  return candidates[0] ?? content.mockTests[0];
}

export function getLocalizedLabel(params: {
  country: CountryKey;
  lang: 'en' | 'local';
}): string {
  // UI label only; the actual text comes from question.study JSON.
  if (params.lang === 'en') return 'English';
  if (params.country === 'nepal') return 'Nepali';
  if (params.country === 'canada') return 'French';
  return 'Local';
}

// Helps reduce repeated content downloads/parsing.
export async function touchStorageKey(key: string): Promise<void> {
  try {
    await AsyncStorage.getItem(key);
  } catch {
    // ignore
  }
}

