import axios from 'axios';
import { Coordinates, RouteData, RouteType } from '../types';
import { ROUTE_API_URL, ROUTE_APP_TOKEN } from '../config';
import { metersToSteps } from './stepService';
import { generateWaypoints } from '../utils/waypointGenerator';

async function getRoute(
  waypoints: Coordinates[],
  strideLength: number,
): Promise<RouteData> {
  const coordinates = waypoints.map((wp) => [wp.longitude, wp.latitude]);

  let response;
  try {
    response = await axios.post(
      ROUTE_API_URL,
      { profile: 'foot-walking', coordinates },
      { headers: { 'Content-Type': 'application/json', 'X-App-Token': ROUTE_APP_TOKEN } },
    );
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      if (status === 429) {
        throw new Error('Trop de requêtes, veuillez réessayer dans quelques instants.');
      } else if (status === 400) {
        throw new Error('Impossible de générer le trajet.');
      } else {
        throw new Error('Une erreur réseau est survenue.');
      }
    }
    throw new Error('Une erreur réseau est survenue.');
  }

  const feature = response.data.features[0];
  const rawCoords: [number, number][] = feature.geometry.coordinates;
  const distanceMeters: number = feature.properties.summary.distance;

  return {
    geometry: rawCoords.map(([lng, lat]) => ({ latitude: lat, longitude: lng })),
    distanceMeters,
    estimatedSteps: metersToSteps(distanceMeters, strideLength),
  };
}

export async function getOptimizedRoute(
  start: Coordinates,
  targetDistanceM: number,
  routeType: RouteType,
  strideLength: number,
  onProgress?: (attempt: number, max: number) => void,
): Promise<RouteData> {
  const MAX_ITERATIONS = 5;
  const toleranceM = 500 * strideLength; // ±500 pas

  // Bearing fixé une fois pour toutes les itérations (même direction, distance ajustée)
  const bearing = Math.random() * 360;
  let currentDistance = targetDistanceM;
  let best: RouteData | null = null;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    onProgress?.(i + 1, MAX_ITERATIONS);
    const waypoints = generateWaypoints(start, currentDistance, routeType, bearing);
    const route = await getRoute(waypoints, strideLength);

    const error = Math.abs(route.distanceMeters - targetDistanceM);

    if (best === null || error < Math.abs(best.distanceMeters - targetDistanceM)) {
      best = route;
    }

    if (error <= toleranceM) break;

    // Correction proportionnelle : scale la distance pour la prochaine itération
    currentDistance *= targetDistanceM / route.distanceMeters;
  }

  return best!;
}
