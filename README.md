# StepRoute

Application mobile React Native qui génère des parcours de marche à partir d'un objectif en nombre de pas.

## Stack

- **Framework** : Expo SDK 54 + TypeScript
- **Navigation** : React Navigation (Stack + Bottom Tabs)
- **État** : Zustand avec persistance AsyncStorage
- **Carte** : MapLibre (OpenStreetMap / CartoDB Dark Matter)
- **Routing** : openrouteservice API
- **Geocoding** : Nominatim

## Fonctionnalités

- Génération de parcours (boucle, aller-retour, aller simple) à partir d'un nombre de pas
- Optimisation itérative du parcours (±500 pas de tolérance, max 5 itérations)
- Zoom automatique sur le parcours généré
- Recentrage de la carte via bouton flottant
- Regénération du parcours sans quitter la carte
- Export GPX (partage vers Strava, Komoot…)
- Historique des 20 derniers parcours (persisté)
- Mode sombre / clair / système
- Persistance des préférences (taille, type de parcours, thème)

## Structure

```
src/
  components/RouteInfo.tsx        — distance + pas estimés
  screens/HomeScreen.tsx          — formulaire de génération
  screens/MapScreen.tsx           — carte + parcours
  screens/HistoryScreen.tsx       — historique des parcours
  screens/SettingsScreen.tsx      — taille, foulée, thème
  services/geocodingService.ts    — Nominatim (suggestions, recherche)
  services/locationService.ts     — expo-location (position GPS)
  services/routeService.ts        — ORS API + optimisation itérative
  services/stepService.ts         — conversions pas ↔ distance
  store/useStore.ts               — Zustand + persist (AsyncStorage)
  types/index.ts                  — RouteType, Coordinates, RouteData, HistoryEntry
  utils/gpxExport.ts              — export GPX via expo-file-system + expo-sharing
  utils/waypointGenerator.ts      — génération de waypoints avec bearing aléatoire
  theme.ts                        — tokens couleur light/dark, hook useAppScheme
  config.ts                       — ORS_API_KEY (non versionné)
```

## Installation

```bash
pnpm install
```

Créer `src/config.ts` avec la clé API openrouteservice :

```ts
export const ORS_API_KEY = 'votre_clé_ici';
```

## Développement

```bash
# Démarrer le serveur de développement
npx expo start

# Build Android (device USB)
npx expo run:android

# Vérifier les types
pnpm exec tsc --noEmit
```

## Algorithme de génération

1. `stepsToMeters(steps, strideLength)` → distance cible en mètres
2. Un bearing aléatoire est fixé pour toutes les itérations
3. Boucle max 5 itérations : appel ORS → correction proportionnelle si écart > ±500 pas
4. La meilleure itération (écart minimal) est retournée
