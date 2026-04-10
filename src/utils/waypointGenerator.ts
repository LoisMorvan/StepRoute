import { Coordinates, RouteType } from '../types';

function offsetCoords(
  origin: Coordinates,
  distanceM: number,
  bearingDeg: number,
): Coordinates {
  const lat = origin.latitude;
  const lng = origin.longitude;
  const bearing = (bearingDeg * Math.PI) / 180;

  const deltaLat = distanceM / 111320;
  const deltaLng = distanceM / (111320 * Math.cos((lat * Math.PI) / 180));

  return {
    latitude: lat + deltaLat * Math.cos(bearing),
    longitude: lng + deltaLng * Math.sin(bearing),
  };
}

export function generateWaypoints(
  start: Coordinates,
  targetDistanceM: number,
  routeType: RouteType,
  bearing = Math.random() * 360,
): Coordinates[] {
  switch (routeType) {
    case 'loop': {
      const r = targetDistanceM / (2 * Math.PI);
      return [
        start,
        offsetCoords(start, r, bearing),
        offsetCoords(start, r, bearing + 120),
        offsetCoords(start, r, bearing + 240),
        start,
      ];
    }
    case 'round-trip': {
      return [start, offsetCoords(start, targetDistanceM / 2, bearing), start];
    }
    case 'one-way': {
      return [start, offsetCoords(start, targetDistanceM, bearing)];
    }
  }
}
