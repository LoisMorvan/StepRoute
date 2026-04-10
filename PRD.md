# 📱 PRD — StepRoute (V1)

## 1. Overview

StepRoute est une application mobile permettant de générer des parcours de marche basés sur un objectif de pas quotidien.

L’utilisateur définit :

- son objectif de pas
- un point de départ
- éventuellement un point d’arrivée
- un type de parcours (boucle, aller simple, aller-retour)

L’application génère ensuite un itinéraire adapté et l’affiche sur une carte.

---

## 2. Objectifs

### Objectif principal

Permettre à un utilisateur de transformer un objectif de pas en un itinéraire concret.

### Objectifs secondaires

- Offrir une UX simple et rapide
- Générer des parcours cohérents (pas absurdes)
- Créer une base solide pour une évolution future (offline, tracking, etc.)

---

## 3. User Stories

### US1 — Définir un objectif

En tant qu’utilisateur, je veux entrer un nombre de pas pour générer un trajet adapté.

### US2 — Définir un point de départ

Je veux utiliser ma position actuelle ou choisir un point sur la carte.

### US3 — Choisir un type de trajet

Je veux choisir entre :

- boucle
- aller simple
- aller-retour

### US4 — Voir le trajet

Je veux visualiser le parcours sur une carte.

### US5 — Voir les infos

Je veux voir :

- distance totale
- estimation des pas

---

## 4. Fonctionnalités

### 4.1 Input utilisateur

- Nombre de pas
- Taille (optionnel)
- Type de trajet
- Point de départ
- Point d’arrivée (optionnel)

### 4.2 Calcul

- Conversion pas → distance
- Génération de waypoints
- Appel API routing

### 4.3 Carte

- Affichage du trajet
- Marker départ / arrivée

---

## 5. Non-objectifs (V1)

- Pas de mode offline complet
- Pas de tracking temps réel
- Pas d’historique
- Pas de compte utilisateur

---

## 6. Contraintes

- React Native + TypeScript
- Gratuit (API openrouteservice)
- Fonctionnement mobile uniquement

---

## 7. KPIs (portfolio)

- App fonctionnelle installable APK
- UX fluide
- Code propre et structuré
