import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Coordinates } from '../types';

export async function exportGPX(geometry: Coordinates[], name: string) {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) throw new Error('Sharing is not available on this device');

  const trkpts = geometry
    .map((c) => `    <trkpt lat="${c.latitude}" lon="${c.longitude}"></trkpt>`)
    .join('\n');

  const gpx = `<?xml version="1.0"?>
<gpx version="1.1" creator="StepRoute">
  <trk><name>${name}</name><trkseg>
${trkpts}
  </trkseg></trk>
</gpx>`;

  const uri = `${FileSystem.cacheDirectory}steproute_${Date.now()}.gpx`;
  await FileSystem.writeAsStringAsync(uri, gpx, { encoding: 'utf8' });
  await Sharing.shareAsync(uri, { mimeType: 'application/gpx+xml', UTI: 'com.topografix.gpx' });
}
