# Product Requirements

## Overview

StepRoute is a mobile app that generates walking routes from a target number of steps.

The user chooses a step objective, a starting point, route preferences, and a route type. The app then requests a matching walking route, displays it on a map, and lets the user save, revisit, favorite, or export the route.

## Goals

- Turn a vague step objective into a concrete walking route.
- Keep the generation flow simple enough to use before going out for a walk.
- Provide useful route context: distance, estimated steps, duration, and map preview.
- Keep history and preferences local to the device.
- Avoid exposing routing provider secrets in the mobile app.

## Core User Stories

- As a walker, I can enter a target number of steps and generate a route close to that target.
- As a walker, I can use my current location or search for a starting address.
- As a walker, I can choose between loop, out-and-back, and one-way routes.
- As a walker, I can see the generated route on a map.
- As a walker, I can regenerate a route without returning to the initial form.
- As a walker, I can open the route in another map app or export it as GPX.
- As a returning user, I can find recent routes and mark useful routes as favorites.
- As a user, I can choose language, theme, stride-related settings, and route preferences.

## Current Scope

- Route generation from target steps.
- Location permission flow.
- Address search through Nominatim.
- Map display through MapLibre.
- Local route history capped at 20 entries.
- Favorite routes.
- GPX export.
- External map opening.
- Light, dark, and system themes.
- English/French localization.
- Privacy policy screen and hosted privacy policy page.

## Non-Goals

- User accounts.
- Cloud sync.
- Social features.
- Full offline routing.
- Turn-by-turn navigation.
- Fitness tracker integration.

## Product Constraints

- Mobile-first experience.
- Physical-device target rather than Expo Go.
- No routing provider key in the mobile app.
- Local persistence only for user preferences and route history.

## Success Criteria

- A route can be generated from a target step count in a few interactions.
- The generated route is understandable on the map.
- History, favorites, preferences, and theme persist across app restarts.
- The repository can be understood by someone reviewing it as a portfolio project.

