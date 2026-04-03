import { create } from 'zustand';
import { User, signOut as fSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useProfileStore } from '@/store/profileStore';
import { useExamStore } from '@/store/examStore';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  initialized: boolean;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setInitialized: (val: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  initialized: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  updateUser: (updates) => set((state) => ({ 
    user: state.user ? { ...state.user, ...updates } as User : null 
  })),
  setInitialized: (initialized) => set({ initialized }),
  logout: async () => {
    try {
      await fSignOut(auth);
    } catch (e) {
      console.error('Logout error', e);
    }
  }
}));

// Subscribe to Firebase Auth state changes
onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
  if (!useAuthStore.getState().initialized) {
    useAuthStore.getState().setInitialized(true);
  }
  // Hydrate the user profile (country/license type) for country-based content.
  if (user) {
    useProfileStore.getState().loadProfile().catch(() => {
      // profile hydration failure shouldn't block app login
    });
    useExamStore.getState().syncHistoryFromFirestore().catch(() => {});
  } else {
    useProfileStore.getState().setProfile(null);
  }
});
