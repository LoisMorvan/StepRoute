# Architecture

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- React Navigation
- Zustand with AsyncStorage persistence
- MapLibre React Native
- Axios
- Nominatim geocoding
- Cloudflare Worker route proxy

## High-Level Flow

```txt
Screens
  |
  v
Zustand store
  |
  v
Services
  |
  v
External services
```

Screens own the user interaction. The store owns local app state and persisted preferences. Services isolate location, geocoding, routing, step conversion, and export behavior.

## Navigation

```txt
Stack Navigator
  |
  +-- Tab Navigator
  |     +-- HomeScreen
  |     +-- HistoryScreen
  |     +-- FavoritesScreen
  |     +-- SettingsScreen
  |
  +-- MapScreen
  +-- PrivacyPolicyScreen
```

The tab navigator handles the main app sections. `MapScreen` is pushed on top after a route is generated or selected from history/favorites.

## State Model

State lives in `src/store/useStore.ts`.

Persisted fields:

- `heightCm`
- `routeType`
- `steps`
- `history`
- `themePreference`
- `language`
- `avoidHighways`
- `preferGreen`
- `isTracking`
- `liveStepsSnapshot`

Session-only fields:

- `startLocation`
- `routeData`
- `isLoading`
- `error`

History is capped to 20 entries. Favorites are stored as flags on history entries.

## Route Generation

The mobile app does not call the routing provider directly. It calls the route proxy URL configured in `src/config.ts`.

```txt
HomeScreen / MapScreen
  |
  v
stepService converts steps to meters
  |
  v
routeService sends route payload
  |
  v
Cloudflare Worker proxy
  |
  v
Routing provider
```

The app sends:

- start coordinates
- route type
- target steps
- stride length
- target distance
- route preferences such as avoiding highways or preferring green areas

The Worker owns provider-specific routing behavior and keeps provider secrets outside the mobile app.

## Geocoding And Location

- `locationService.ts` handles device location permission and current coordinates.
- `geocodingService.ts` handles address search through Nominatim.
- Screens use services instead of calling external APIs directly.

## Theming And Localization

- `src/theme.ts` resolves system/light/dark color schemes and exposes color tokens.
- `src/i18n.ts` provides English/French UI copy.
- Theme and language preferences are persisted through the Zustand store.

## Privacy And Secrets

- The mobile app contains no routing provider API key.
- Local environment files are ignored.
- Android debug keystores are ignored and are not tracked.
- The public repository excludes the Cloudflare Worker source because it contains deployment-specific routing infrastructure.

