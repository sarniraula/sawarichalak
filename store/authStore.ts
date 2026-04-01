import { create } from 'zustand';
import { User, signOut as fSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
});
