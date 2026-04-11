import axios from 'axios';
import { ROUTE_API_URL } from '../config';
import { Coordinates, RouteData, RouteType } from '../types';

interface RouteGenerationPayload {
  profile: 'foot-walking';
  routeType: RouteType;
  start: Coordinates;
  steps: number;
  strideLength: number;
  targetDistanceM: number;
}

async function getRoute(payload: RouteGenerationPayload): Promise<RouteData> {
  try {
    const response = await axios.post<RouteData>(ROUTE_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      if (status === 429) {
        throw new Error('Trop de requêtes, veuillez réessayer dans quelques instants.');
      }
      if (status === 400) {
        throw new Error('Impossible de générer le trajet.');
      }
      throw new Error('Une erreur réseau est survenue.');
    }

    throw new Error('Une erreur réseau est survenue.');
  }
}

export async function getOptimizedRoute(
  start: Coordinates,
  targetDistanceM: number,
  routeType: RouteType,
  strideLength: number,
  onProgress?: (attempt: number, max: number) => void,
): Promise<RouteData> {
  const steps = Math.max(100, Math.round(targetDistanceM / strideLength));
  onProgress?.(1, 1);

  return getRoute({
    profile: 'foot-walking',
    routeType,
    start,
    steps,
    strideLength,
    targetDistanceM,
  });
}
