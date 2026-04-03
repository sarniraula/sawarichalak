import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CountryKey, LicenseType } from '@/types/content';
import type { UserProfile } from '@/types/profile';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile, updateUserProfile } from '@/services/firestoreProfile';

interface ProfileState {
  profile: UserProfile | null;
  initialized: boolean;
  loadProfile: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
  setCountry: (country: CountryKey) => Promise<void>;
  setLicenseType: (licenseType: LicenseType) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      initialized: false,
      setProfile: (profile) => set({ profile }),

      loadProfile: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          set({ profile: null, initialized: true });
          return;
        }

        const existing = get().profile;
        if (existing) {
          set({ initialized: true });
        }

        try {
          const fetched = await getUserProfile(currentUser.uid);
          if (fetched) {
            set({ profile: fetched, initialized: true });
            return;
          }
        } catch {
          // handled below with fallback profile
        }

        // Self-heal: create a default profile for old users who signed up before profile docs existed.
        const fallbackCountry: CountryKey = existing?.country ?? 'nepal';
        const fallbackLicenseType: LicenseType = existing?.licenseType ?? 'Car';
        const fallbackProfile: UserProfile = {
          id: currentUser.uid,
          email: currentUser.email ?? existing?.email ?? 'unknown@example.com',
          country: fallbackCountry,
          licenseType: fallbackLicenseType,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
        };

        set({ profile: fallbackProfile, initialized: true });

        // Best-effort write so future loads are fully remote-backed.
        createUserProfile({
          uid: currentUser.uid,
          email: fallbackProfile.email,
          country: fallbackProfile.country,
          licenseType: fallbackProfile.licenseType,
        }).catch(() => {});
      },

      setCountry: async (country) => {
        const currentUser = auth.currentUser;
        set((state) => {
          if (!state.profile) return state;
          return { profile: { ...state.profile, country } };
        });
        if (!currentUser) return;
        const licenseType = get().profile?.licenseType;
        if (!licenseType) return;
        await updateUserProfile({ uid: currentUser.uid, country, licenseType });
      },

      setLicenseType: async (licenseType) => {
        const currentUser = auth.currentUser;
        set((state) => {
          if (!state.profile) return state;
          return { profile: { ...state.profile, licenseType } };
        });
        if (!currentUser) return;
        const country = get().profile?.country;
        if (!country) return;
        await updateUserProfile({ uid: currentUser.uid, country, licenseType });
      },
    }),
    {
      name: 'sawarichalak-profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
      }),
    },
  ),
);

