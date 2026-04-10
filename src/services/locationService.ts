import * as Location from 'expo-location';
import { Coordinates } from '../types';

export async function getCurrentLocation(): Promise<Coordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission de localisation refusée');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
