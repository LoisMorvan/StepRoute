import axios from 'axios';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export interface AddressSuggestion {
  latitude: number;
  longitude: number;
  label: string;
}

export async function searchAddress(query: string): Promise<AddressSuggestion> {
  const response = await axios.get<NominatimResult[]>(
    'https://nominatim.openstreetmap.org/search',
    {
      params: { q: query, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'StepRoute/1.0' },
    },
  );

  if (response.data.length === 0) {
    throw new Error('Adresse introuvable');
  }

  const result = response.data[0];
  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    label: result.display_name,
  };
}

export async function suggestAddresses(query: string): Promise<AddressSuggestion[]> {
  if (!query.trim()) return [];
  try {
    const response = await axios.get<NominatimResult[]>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: { q: query, format: 'json', limit: 5 },
        headers: { 'User-Agent': 'StepRoute/1.0' },
      },
    );
    return response.data.map((r) => ({
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      label: r.display_name,
    }));
  } catch {
    return [];
  }
}
