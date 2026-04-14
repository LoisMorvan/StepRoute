import type { ExpoConfig } from 'expo/config';

const routeApiUrl =
  process.env.EXPO_PUBLIC_ROUTE_API_URL ?? 'https://steproute.lois-morvan.workers.dev';

const config: ExpoConfig = {
  name: 'StepRoute',
  slug: 'steproute',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    versionCode: 2,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.loismorvan.steproute',
    permissions: [
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.INTERNET',
      'android.permission.ACTIVITY_RECOGNITION',
    ],
  },
  plugins: [
    ['expo-sensors', { motionPermission: 'Allow StepRoute to count your steps while walking.' }],
  ],
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    routeApiUrl,
    eas: {
      projectId: '95255a5f-525b-4df5-94b1-f7a66559f1b5',
    },
  },
  owner: 'dadfreddy',
};

export default config;
