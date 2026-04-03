import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from './themeTypes';

type ThemePreference = ThemeMode | 'system';

interface ThemeState {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      setThemePreference: (themePreference) => set({ themePreference }),
    }),
    {
      name: 'sawarichalak-theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

