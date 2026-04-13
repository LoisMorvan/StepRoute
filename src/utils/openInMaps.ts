import { Linking } from 'react-native';
import { Coordinates } from '../types';

/** Returns up to `max` evenly-sampled intermediate points (excludes first/last). */
function sampleIntermediatePoints(geometry: Coordinates[], max: number): Coordinates[] {
  const inner = geometry.slice(1, -1);
  if (inner.length <= max) return inner;
  const step = (inner.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => inner[Math.round(i * step)]);
}

export async function openInMaps(geometry: Coordinates[]) {
  if (geometry.length < 2) throw new Error('Not enough points');

  const origin = geometry[0];
  const destination = geometry[geometry.length - 1];
  const waypoints = sampleIntermediatePoints(geometry, 8);

  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: 'walking',
  });
  if (waypoints.length > 0) {
    params.set(
      'waypoints',
      waypoints.map((p) => `${p.latitude},${p.longitude}`).join('|'),
    );
  }

  const url = `https://www.google.com/maps/dir/?${params.toString()}`;
  await Linking.openURL(url);
}
