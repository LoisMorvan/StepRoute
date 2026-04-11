import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinates, HistoryEntry, RouteData, RouteType } from '../types';
import { heightToStrideLength } from '../services/stepService';
import { Language } from '../i18n';

export type ThemePreference = 'system' | 'light' | 'dark';

interface StoreState {
  steps: number;
  heightCm: number;
  routeType: RouteType;
  startLocation: Coordinates | null;
  routeData: RouteData | null;
  isLoading: boolean;
  error: string | null;
  history: HistoryEntry[];
  themePreference: ThemePreference;
  language: Language;

  setSteps: (steps: number) => void;
  setHeightCm: (cm: number) => void;
  setRouteType: (type: RouteType) => void;
  setStartLocation: (coords: Coordinates | null) => void;
  setRouteData: (data: RouteData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (entry: HistoryEntry) => void;
  setThemePreference: (pref: ThemePreference) => void;
  setLanguage: (lang: Language) => void;
  reset: () => void;
}

const defaultState = {
  steps: 10000,
  heightCm: 170,
  routeType: 'loop' as RouteType,
  startLocation: null,
  routeData: null,
  isLoading: false,
  error: null,
  history: [] as HistoryEntry[],
  themePreference: 'system' as ThemePreference,
  language: 'en' as Language,
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...defaultState,

      setSteps: (steps) => set({ steps }),
      setHeightCm: (heightCm) => set({ heightCm }),
      setRouteType: (routeType) => set({ routeType }),
      setStartLocation: (startLocation) => set({ startLocation }),
      setRouteData: (routeData) => set({ routeData }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      addToHistory: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 20),
        })),
      setThemePreference: (themePreference) => set({ themePreference }),
      setLanguage: (language) => set({ language }),
      reset: () => set(defaultState),
    }),
    {
      name: 'steproute-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        heightCm: state.heightCm,
        routeType: state.routeType,
        steps: state.steps,
        history: state.history,
        themePreference: state.themePreference,
        language: state.language,
      }),
    },
  ),
);

export function getStrideLength(heightCm: number): number {
  return heightToStrideLength(heightCm);
}
