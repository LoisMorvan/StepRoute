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
  avoidHighways: boolean;
  preferGreen: boolean;
  isTracking: boolean;
  liveStepsSnapshot: number;

  setSteps: (steps: number) => void;
  setHeightCm: (cm: number) => void;
  setRouteType: (type: RouteType) => void;
  setStartLocation: (coords: Coordinates | null) => void;
  setRouteData: (data: RouteData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (entry: HistoryEntry) => void;
  replaceLastHistory: (entry: HistoryEntry) => void;
  toggleFavorite: (id: string) => void;
  setThemePreference: (pref: ThemePreference) => void;
  setLanguage: (lang: Language) => void;
  setAvoidHighways: (v: boolean) => void;
  setPreferGreen: (v: boolean) => void;
  setIsTracking: (v: boolean) => void;
  setLiveStepsSnapshot: (v: number) => void;
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
  avoidHighways: false,
  preferGreen: false,
  isTracking: false,
  liveStepsSnapshot: 0,
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
      replaceLastHistory: (entry) =>
        set((state) => ({
          history: state.history.length > 0
            ? [entry, ...state.history.slice(1)]
            : [entry],
        })),
      toggleFavorite: (id) =>
        set((state) => ({
          history: state.history.map((e) =>
            e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
          ),
        })),
      setThemePreference: (themePreference) => set({ themePreference }),
      setLanguage: (language) => set({ language }),
      setAvoidHighways: (avoidHighways) => set({ avoidHighways }),
      setPreferGreen: (preferGreen) => set({ preferGreen }),
      setIsTracking: (isTracking) => set({ isTracking }),
      setLiveStepsSnapshot: (liveStepsSnapshot) => set({ liveStepsSnapshot }),
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
        avoidHighways: state.avoidHighways,
        preferGreen: state.preferGreen,
        isTracking: state.isTracking,
        liveStepsSnapshot: state.liveStepsSnapshot,
      }),
    },
  ),
);

export function getStrideLength(heightCm: number): number {
  return heightToStrideLength(heightCm);
}
