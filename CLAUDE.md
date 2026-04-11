# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start           # Start Expo dev server
pnpm android         # Build and run on Android
pnpm ios             # Build and run on iOS
pnpm exec tsc --noEmit  # Type-check without emitting
```

No test runner is configured. ESLint uses a flat config (`eslint.config.js`) with `@typescript-eslint` + Prettier. Prettier config in `.prettierrc`: single quotes, semi, 2-space tabs, 90 print width.

## Architecture

StepRoute is an Expo 54 / React Native app that generates walking routes matching a user-specified step count. It targets physical devices (not Expo Go).

**Stack:** TypeScript · Zustand 5 · React Navigation · MapLibre · OpenRouteService (ORS) · Nominatim · expo-location · AsyncStorage · Axios · pnpm

### Layers

```
Screens (src/screens/)
    ↓ read/write
Zustand store (src/store/useStore.ts)
    ↓ call
Services (src/services/)
    ↓ hit
External APIs: ORS (routing) · Nominatim (geocoding)
```

Services are pure async functions — screens never call APIs directly.

### Navigation (`App.tsx`)

```
Stack
 └─ Tabs (Bottom Tabs)
     ├─ HomeScreen      – form, route generation trigger
     ├─ HistoryScreen   – persisted past routes
     └─ SettingsScreen  – preferences (theme, height)
 └─ MapScreen           – stack screen pushed after route is generated
```

### State (`src/store/useStore.ts`)

Zustand store with AsyncStorage `persist` middleware. Persisted fields: `heightCm`, `routeType`, `steps`, `history`, `themePreference`. Session-only (not persisted): `startLocation`, `routeData`, `isLoading`, `error`. History is capped at 20 entries.

### Route Generation Flow

1. User inputs step count + optional start address  
2. `stepsToMeters(steps, heightCm)` converts to target distance (stride = height × 0.413)  
3. `generateWaypoints(start, targetMeters, routeType)` creates intermediate points:  
   - **loop**: 4-point circular (random bearing + 120° offsets)  
   - **round-trip**: out-and-back  
   - **one-way**: point-to-point  
4. `getOptimizedRoute()` iterates up to 5 calls to ORS, proportionally correcting waypoint distances until within ±500 steps of target  
5. Result stored in store → MapScreen pushed → `addToHistory()` persists it

### Theming (`src/theme.ts`)

`useAppScheme(preference)` resolves `'system' | 'light' | 'dark'` to an actual color scheme. `getColors(scheme)` returns all color tokens. Every screen calls both at the top and passes colors via inline styles — there is no StyleSheet shared across files.

### API Keys

ORS API key lives in `src/config.ts` (git-ignored). Nominatim requires no key (rate-limit via 400 ms debounce on address suggestions in HomeScreen).
