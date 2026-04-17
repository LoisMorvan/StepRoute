import MapLibreGL, { CameraRef } from '@maplibre/maplibre-react-native';
import { useNavigation } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteInfo from '../components/RouteInfo';
import { getOptimizedRoute } from '../services/routeService';
import { heightToStrideLength, stepsToMeters } from '../services/stepService';
import { useStore } from '../store/useStore';
import { getColors, useAppScheme } from '../theme';
import { openInMaps } from '../utils/openInMaps';
import { useTranslation } from '../i18n';

MapLibreGL.setAccessToken(null);

const STYLE_URL_LIGHT = 'https://tiles.openfreemap.org/styles/liberty';
const STYLE_URL_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export default function MapScreen() {
  const { routeData, startLocation, steps, heightCm, routeType, avoidHighways, preferGreen, setRouteData, replaceLastHistory, themePreference } = useStore();
  const navigation = useNavigation();
  const [regenerating, setRegenerating] = useState(false);
  const [overlayHeight, setOverlayHeight] = useState(220);
  const [isTracking, setIsTracking] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [liveSteps, setLiveSteps] = useState(0);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const cameraRef = useRef<CameraRef | null>(null);
  const pedometerRef = useRef<{ remove(): void } | null>(null);
  const lastPositionRef = useRef<[number, number] | null>(null);
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);
  const hasInitialZoom = useRef(false);
  const isFollowingUserRef = useRef(false);
  const isTrackingRef = useRef(false);

  useEffect(() => {
    isFollowingUserRef.current = isFollowingUser;
  }, [isFollowingUser]);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  useEffect(() => {
    return () => {
      pedometerRef.current?.remove();
      locationWatchRef.current?.remove();
      deactivateKeepAwake();
    };
  }, []);

  const scheme = useAppScheme(themePreference);
  const c = getColors(scheme);
  const insets = useSafeAreaInsets();
  const mapStyle = scheme === 'dark' ? STYLE_URL_DARK : STYLE_URL_LIGHT;
  const t = useTranslation();

  if (!routeData || routeData.geometry.length < 2) return null;

  const start = routeData.geometry[0];
  const end = routeData.geometry[routeData.geometry.length - 1];

  const lngs = routeData.geometry.map((pt) => pt.longitude);
  const lats = routeData.geometry.map((pt) => pt.latitude);
  const bounds = {
    ne: [Math.max(...lngs), Math.max(...lats)] as [number, number],
    sw: [Math.min(...lngs), Math.min(...lats)] as [number, number],
  };
  const cameraBounds = {
    ne: bounds.ne,
    sw: bounds.sw,
    paddingTop: 60,
    paddingBottom: overlayHeight + 16,
    paddingLeft: 40,
    paddingRight: 40,
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
      const newRoute = await getOptimizedRoute(startLocation, distanceM, routeType, strideLength, avoidHighways, preferGreen);
      setRouteData(newRoute);
      replaceLastHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        routeType,
        steps,
        distanceMeters: newRoute.distanceMeters,
        geometry: newRoute.geometry,
        ascent: newRoute.ascent,
        descent: newRoute.descent,
      });
    } finally {
      setRegenerating(false);
    }
  }

  async function handleOpenInMaps() {
    if (!routeData) return;
    try {
      await openInMaps(routeData.geometry);
    } catch (e) {
      Alert.alert('Open in Maps', String(e));
    }
  }

  function handleRecenter() {
    if (isTracking) {
      setIsFollowingUser(true);
      if (lastPositionRef.current) {
        cameraRef.current?.moveTo(lastPositionRef.current, 300);
      }
      return;
    }
    cameraRef.current?.fitBounds(bounds.ne, bounds.sw, [60, 40, overlayHeight + 16, 40], 500);
  }

  async function handleStartWalk() {
    setLiveSteps(0);
    await activateKeepAwakeAsync();
    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    const granted = locStatus === 'granted';
    setLocationGranted(granted);
    if (!granted) {
      Alert.alert(
        t.map.locationPermissionDeniedTitle,
        t.map.locationPermissionDeniedMessage,
      );
    } else {
      hasInitialZoom.current = false;
      setIsFollowingUser(true);
      locationWatchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 3 },
        (loc) => {
          const pos: [number, number] = [loc.coords.longitude, loc.coords.latitude];
          setUserPosition(pos);
          lastPositionRef.current = pos;
          if (isFollowingUserRef.current) {
            if (!hasInitialZoom.current) {
              cameraRef.current?.setCamera({ centerCoordinate: pos, zoomLevel: 17, animationDuration: 500 });
              hasInitialZoom.current = true;
            } else {
              cameraRef.current?.moveTo(pos, 300);
            }
          }
        },
      );
    }
    const { status } = await Pedometer.requestPermissionsAsync();
    if (status === 'granted') {
      const available = await Pedometer.isAvailableAsync();
      if (available) {
        pedometerRef.current = Pedometer.watchStepCount(({ steps }) => {
          setLiveSteps(steps);
        });
      }
    }
    setIsTracking(true);
  }

  function handleStopWalk() {
    deactivateKeepAwake();
    pedometerRef.current?.remove();
    pedometerRef.current = null;
    locationWatchRef.current?.remove();
    locationWatchRef.current = null;
    setUserPosition(null);
    setIsFollowingUser(false);
    hasInitialZoom.current = false;
    setLiveSteps(0);
    setIsTracking(false);
    setTimeout(() => {
      cameraRef.current?.fitBounds(bounds.ne, bounds.sw, [60, 40, overlayHeight + 16, 40], 500);
    }, 50);
  }

  return (
    <View style={styles.container}>
      <View
        style={styles.map}
        onStartShouldSetResponderCapture={() => {
          if (isTrackingRef.current && isFollowingUserRef.current) {
            isFollowingUserRef.current = false;
            setIsFollowingUser(false);
          }
          return false;
        }}
      >
        <MapLibreGL.MapView
          style={StyleSheet.absoluteFill}
          mapStyle={mapStyle}
          rotateEnabled={true}
          compassEnabled={true}
          compassViewPosition={3}
          compassViewMargins={{ x: 16, y: insets.bottom + overlayHeight + 76 }}
        >
          <MapLibreGL.Camera
            ref={cameraRef}
            bounds={isTracking ? undefined : cameraBounds}
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

          {isTracking && userPosition && (
            <MapLibreGL.PointAnnotation id="userPosition" coordinate={userPosition} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.userDot} />
            </MapLibreGL.PointAnnotation>
          )}
        </MapLibreGL.MapView>
      </View>

      {/* Bouton recentrer flottant — bas droit, juste au-dessus de l'overlay */}
      <TouchableOpacity
        style={[styles.recenterButton, { backgroundColor: c.card, bottom: insets.bottom + overlayHeight + 24 }]}
        onPress={handleRecenter}
        accessibilityLabel={t.map.recenter}
      >
        <Text style={[styles.recenterIcon, { color: isTracking && !isFollowingUser ? c.subtext : '#5DBE4A' }]}>⊙</Text>
      </TouchableOpacity>

      <View
        style={[styles.infoContainer, { bottom: insets.bottom + 16 }]}
        onLayout={(e) => setOverlayHeight(e.nativeEvent.layout.height)}
      >
        <RouteInfo routeData={routeData} />

        {isTracking ? (
          <>
            <View style={[styles.stepCounterCard, { backgroundColor: c.card }]}>
              <Text style={[styles.stepCounterNumber, { color: c.accent }]}>
                {liveSteps.toLocaleString()}
              </Text>
              <Text style={[styles.stepCounterLabel, { color: c.subtext }]}>
                {t.map.stepsWalked}
              </Text>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={handleStopWalk}>
              <Text style={[styles.actionButtonText, { color: '#fff' }]}>{t.map.stopWalk}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
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

              <TouchableOpacity style={[styles.actionButton, styles.startButton]} onPress={handleStartWalk}>
                <Text style={[styles.actionButtonText, { color: '#fff' }]}>{t.map.startWalk}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.actionButton, styles.openMapsButton, { backgroundColor: c.card }]} onPress={handleOpenInMaps}>
              <Text style={[styles.actionButtonText, { color: c.accent }]}>{t.map.openInMaps}</Text>
            </TouchableOpacity>
          </>
        )}

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
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  recenterButton: {
    position: 'absolute',
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
  recenterIcon: { fontSize: 22, lineHeight: 24 },
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
    paddingVertical: 9,
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
  startButton: { backgroundColor: '#5DBE4A' },
  stepCounterCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  stepCounterNumber: { fontSize: 28, fontWeight: '700', lineHeight: 32 },
  stepCounterLabel: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  openMapsButton: { flex: undefined },
  stopButton: {
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    backgroundColor: '#e74c3c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    borderRadius: 12,
    paddingVertical: 9,
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
