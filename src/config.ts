import Constants from 'expo-constants';

const fallbackRouteApiUrl = 'https://steproute.lois-morvan.workers.dev';

type ExtraConfig = {
  routeApiUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

export const ROUTE_API_URL = extra.routeApiUrl ?? fallbackRouteApiUrl;
