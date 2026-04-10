export type RouteType = 'loop' | 'one-way' | 'round-trip';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserInput {
  steps: number;
  strideLength: number;
  routeType: RouteType;
  startLocation: Coordinates | null;
}

export interface RouteData {
  geometry: Coordinates[];
  distanceMeters: number;
  estimatedSteps: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  routeType: RouteType;
  steps: number;
  distanceMeters: number;
  geometry: Coordinates[];
}
