import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CanadaRegionKey = 'ON' | 'BC' | 'QC';

interface RegionState {
  canadaRegionKey: CanadaRegionKey;
  setCanadaRegionKey: (key: CanadaRegionKey) => void;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      canadaRegionKey: 'ON',
      setCanadaRegionKey: (canadaRegionKey) => set({ canadaRegionKey }),
    }),
    {
      name: 'sawarichalak-region',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

