import MapLibreGL, { CameraRef } from '@maplibre/maplibre-react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteInfo from '../components/RouteInfo';
import { getOptimizedRoute } from '../services/routeService';
import { heightToStrideLength, stepsToMeters } from '../services/stepService';
import { useStore } from '../store/useStore';
import { getColors, useAppScheme } from '../theme';
import { exportGPX } from '../utils/gpxExport';
import { useTranslation } from '../i18n';

MapLibreGL.setAccessToken(null);

const STYLE_URL_LIGHT = 'https://tiles.openfreemap.org/styles/liberty';
const STYLE_URL_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export default function MapScreen() {
  const { routeData, startLocation, steps, heightCm, routeType, setRouteData, replaceLastHistory, themePreference } = useStore();
  const navigation = useNavigation();
  const [regenerating, setRegenerating] = useState(false);
  const cameraRef = useRef<CameraRef | null>(null);
  const scheme = useAppScheme(themePreference);
  const c = getColors(scheme);
  const insets = useSafeAreaInsets();
  const mapStyle = scheme === 'dark' ? STYLE_URL_DARK : STYLE_URL_LIGHT;
  const t = useTranslation();

  if (!routeData || routeData.geometry.length < 2) return null;

  const start = routeData.geometry[0];
  const end = routeData.geometry[routeData.geometry.length - 1];

  const coords = routeData.geometry.map((pt) => [pt.longitude, pt.latitude]);
  const lngs = coords.map((pt) => pt[0]);
  const lats = coords.map((pt) => pt[1]);
  const bounds = {
    ne: [Math.max(...lngs), Math.max(...lats)] as [number, number],
    sw: [Math.min(...lngs), Math.min(...lats)] as [number, number],
  };

  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeData.geometry.map((pt) => [pt.longitude, pt.latitude]),
    },
  };

  async function handleRegenerate() {
    if (!startLocation) return;
    setRegenerating(true);
    try {
      const strideLength = heightToStrideLength(heightCm);
      const distanceM = stepsToMeters(steps, strideLength);
      const newRoute = await getOptimizedRoute(startLocation, distanceM, routeType, strideLength);
      setRouteData(newRoute);
      replaceLastHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        routeType,
        steps,
        distanceMeters: newRoute.distanceMeters,
        geometry: newRoute.geometry,
      });
    } finally {
      setRegenerating(false);
    }
  }

  async function handleExportGPX() {
    if (!routeData) return;
    try {
      await exportGPX(routeData.geometry, t.map.myRoute);
    } catch (e) {
      Alert.alert('Export GPX', String(e));
    }
  }

  function handleRecenter() {
    cameraRef.current?.fitBounds(bounds.ne, bounds.sw, [60, 40, 220, 40], 500);
  }

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView style={styles.map} mapStyle={mapStyle}>
        <MapLibreGL.Camera
          ref={cameraRef}
          bounds={{ ne: bounds.ne, sw: bounds.sw, paddingTop: 60, paddingBottom: 220, paddingLeft: 40, paddingRight: 40 }}
          animationDuration={500}
        />

        <MapLibreGL.ShapeSource id="route" shape={routeGeoJSON}>
          <MapLibreGL.LineLayer
            id="routeLine"
            style={{ lineColor: c.accent, lineWidth: 4, lineJoin: 'round', lineCap: 'round' }}
          />
        </MapLibreGL.ShapeSource>

        <MapLibreGL.PointAnnotation id="start" coordinate={[start.longitude, start.latitude]}>
          <View style={[styles.marker, styles.markerStart]} />
        </MapLibreGL.PointAnnotation>

        <MapLibreGL.PointAnnotation id="end" coordinate={[end.longitude, end.latitude]}>
          <View style={[styles.marker, styles.markerEnd]} />
        </MapLibreGL.PointAnnotation>
      </MapLibreGL.MapView>

      {/* Bouton recentrer flottant */}
      <TouchableOpacity
        style={[styles.recenterButton, { backgroundColor: c.card }]}
        onPress={handleRecenter}
        accessibilityLabel={t.map.recenter}
      >
        <Text style={styles.recenterIcon}>⊙</Text>
      </TouchableOpacity>

      <View style={[styles.infoContainer, { bottom: insets.bottom + 16 }]}>
        <RouteInfo routeData={routeData} />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: c.card }, regenerating && styles.actionButtonDisabled]}
            onPress={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <ActivityIndicator color={c.accent} size="small" />
            ) : (
              <Text style={[styles.actionButtonText, { color: c.accent }]}>{t.map.regenerate}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: c.card }]} onPress={handleExportGPX}>
            <Text style={[styles.actionButtonText, { color: c.accent }]}>{t.map.exportGPX}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: c.card }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: c.accent }]}>{t.map.newRoute}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
  markerStart: { backgroundColor: '#5DBE4A' },
  markerEnd: { backgroundColor: '#e74c3c' },
  recenterButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  recenterIcon: { fontSize: 22, color: '#5DBE4A', lineHeight: 24 },
  infoContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 10,
  },
  buttonRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonDisabled: { opacity: 0.6 },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
  backButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonText: { fontSize: 15, fontWeight: '500' },
});
