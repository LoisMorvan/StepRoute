import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Coordinates } from '../types';

export async function exportGPX(geometry: Coordinates[], name: string) {
  const trkpts = geometry
    .map((c) => `    <trkpt lat="${c.latitude}" lon="${c.longitude}"></trkpt>`)
    .join('\n');

  const gpx = `<?xml version="1.0"?>
<gpx version="1.1" creator="StepRoute">
  <trk><name>${name}</name><trkseg>
${trkpts}
  </trkseg></trk>
</gpx>`;

  const file = new File(Paths.cache, `steproute_${Date.now()}.gpx`);
  await file.write(gpx);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/gpx+xml' });
}
