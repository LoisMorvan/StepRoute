# 🏗️ Architecture — StepRoute V1

## 1. Stack

### Frontend

- React Native (Expo)
- TypeScript

### Librairies

- expo-location
- react-native-maps ou maplibre
- axios
- zustand (state management)

### API externe

- openrouteservice

---

## 2. Architecture globale

Mobile App uniquement (pas de backend)

```txt
UI → State → Services → API
```

---

## 3. Structure projet

```txt
src/
  components/
  screens/
  services/
  store/
  utils/
  types/
```

---

## 4. Modules

### 4.1 Location Service

- récupère la position utilisateur

### 4.2 Step Service

- convertit pas → distance

### 4.3 Route Service

- appelle openrouteservice
- gère les waypoints

---

## 5. Flux principal

1. User input
2. Conversion pas → distance
3. Génération waypoints
4. Appel API routing
5. Retour géométrie
6. Affichage carte

---

## 6. Gestion d’état

Zustand store :

- userInput
- routeData
- loadingState

---

## 7. API routing

POST openrouteservice:

- start
- end
- waypoints

Retour :

- geometry
- distance

---

## 8. Évolutivité

Future :

- offline cache
- backend Node
- algo amélioré
