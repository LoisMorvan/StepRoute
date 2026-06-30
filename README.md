# StepRoute

Mobile walking-route generator built with Expo and React Native.

StepRoute turns a target number of steps into a walking route, displays it on a map, keeps recent routes locally, and exports GPX files for apps such as Strava or Komoot.

## Features

- Generate walking routes from a target number of steps.
- Route modes: loop, out-and-back, and one-way.
- Iterative distance optimization with a step tolerance window.
- Address search and current-location support.
- Map display with MapLibre.
- Route regeneration from the map screen.
- GPX export through the native share sheet.
- Local history for recent routes.
- Persisted preferences for stride length, route type, and theme.
- Light, dark, and system themes.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- React Navigation
- Zustand with AsyncStorage persistence
- MapLibre React Native
- expo-location
- expo-file-system and expo-sharing
- Nominatim geocoding
- Routing through a Cloudflare Worker proxy

## Architecture

```txt
Target steps + route type
        |
        v
Step conversion
        |
        v
Waypoint generation
        |
        v
Routing worker
        |
        v
Optimized route
        |
        +--> Map display
        +--> Local history
        +--> GPX export
```

The routing provider key is not stored in the mobile app. The app calls a Cloudflare Worker endpoint, and the Worker owns the provider integration.

## Project Structure

```txt
src/
  components/RouteInfo.tsx
  screens/HomeScreen.tsx
  screens/MapScreen.tsx
  screens/HistoryScreen.tsx
  screens/SettingsScreen.tsx
  services/geocodingService.ts
  services/locationService.ts
  services/routeService.ts
  services/stepService.ts
  store/useStore.ts
  types/index.ts
  utils/gpxExport.ts
  utils/waypointGenerator.ts
  theme.ts
  config.ts
```

## Configuration

By default, the app uses the public route proxy URL defined in `src/config.ts`.

For another environment, provide an Expo extra value named `routeApiUrl`.

Example:

```json
{
  "expo": {
    "extra": {
      "routeApiUrl": "https://your-worker.example.com"
    }
  }
}
```

## Development

```bash
pnpm install
npx expo start
```

Run on Android:

```bash
npx expo run:android
```

Type-check:

```bash
pnpm exec tsc --noEmit
```

## Route Generation

1. Convert the target step count to meters using the configured stride length.
2. Generate waypoints based on the selected route mode.
3. Request a route from the routing worker.
4. Compare the resulting distance with the target.
5. Adjust waypoint distance and retry for up to 5 iterations.
6. Keep the best route found within the tolerance window.

## Privacy And Secrets

- No routing API key is committed in the app source.
- Local environment files are ignored.
- Android debug keystores are ignored and should stay local.

## Status

This is a personal mobile project and a public portfolio repository.
