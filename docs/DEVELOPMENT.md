# Development Notes

## Requirements

- Node.js 20+
- pnpm
- Expo tooling
- Android Studio / Android SDK for Android builds

## Commands

```bash
pnpm install
pnpm start
pnpm android
pnpm ios
pnpm exec tsc --noEmit
```

No test runner is currently configured. TypeScript validation is the main automated check.

## Formatting And Linting

- ESLint uses the flat config in `eslint.config.js`.
- Prettier uses `.prettierrc`.
- Style defaults: single quotes, semicolons, 2-space indentation, 90-character print width.

## Configuration

The route API URL is read from Expo config:

```ts
Constants.expoConfig?.extra?.routeApiUrl
```

If no value is provided, `src/config.ts` falls back to the public route proxy URL.

## Public Repository Notes

- Do not commit `.env` files.
- Do not commit Android signing keys or debug keystores.
- Keep provider credentials inside deployment infrastructure, not the mobile app.
- Keep generated build output out of Git.

