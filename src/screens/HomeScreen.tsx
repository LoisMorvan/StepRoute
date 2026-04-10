import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { getCurrentLocation } from '../services/locationService';
import { AddressSuggestion, searchAddress, suggestAddresses } from '../services/geocodingService';
import { stepsToMeters, heightToStrideLength } from '../services/stepService';
import { getOptimizedRoute } from '../services/routeService';
import { RouteType } from '../types';
import { getColors, useAppScheme } from '../theme';

const ROUTE_TYPES: { label: string; value: RouteType }[] = [
  { label: 'Boucle', value: 'loop' },
  { label: 'Aller-retour', value: 'round-trip' },
  { label: 'Aller simple', value: 'one-way' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    steps,
    heightCm,
    routeType,
    startLocation,
    isLoading,
    error,
    themePreference,
    setSteps,
    setRouteType,
    setStartLocation,
    setRouteData,
    setLoading,
    setError,
    addToHistory,
  } = useStore();

  const [stepsInput, setStepsInput] = useState(String(steps));
  const [addressInput, setAddressInput] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [isGeocodingLoading, setGeocodingLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [progressMsg, setProgressMsg] = useState('');
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheme = useAppScheme(themePreference);
  const c = getColors(scheme);
  const strideLength = heightToStrideLength(heightCm);

  function handleAddressChange(text: string) {
    setAddressInput(text);
    setUsingCurrentLocation(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await suggestAddresses(text.trim());
      setSuggestions(results);
    }, 400);
  }

  function handleSelectSuggestion(s: AddressSuggestion) {
    setStartLocation({ latitude: s.latitude, longitude: s.longitude });
    setAddressLabel(s.label);
    setAddressInput(s.label.split(',')[0].trim());
    setUsingCurrentLocation(false);
    setSuggestions([]);
  }

  async function handleUseLocation() {
    setError(null);
    setSuggestions([]);
    try {
      const coords = await getCurrentLocation();
      setStartLocation(coords);
      setAddressLabel('');
      setAddressInput('');
      setUsingCurrentLocation(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Impossible de récupérer la position');
    }
  }

  async function handleSearchAddress() {
    if (!addressInput.trim()) return;
    setError(null);
    setSuggestions([]);
    setGeocodingLoading(true);
    try {
      const result = await searchAddress(addressInput.trim());
      setStartLocation({ latitude: result.latitude, longitude: result.longitude });
      setAddressLabel(result.label);
      setUsingCurrentLocation(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Adresse introuvable');
    } finally {
      setGeocodingLoading(false);
    }
  }

  async function handleGenerate() {
    const parsedSteps = parseInt(stepsInput, 10);
    if (isNaN(parsedSteps) || parsedSteps < 100) {
      setError('Entrez un nombre de pas valide (minimum 100)');
      return;
    }
    if (!startLocation) {
      setError('Veuillez définir un point de départ');
      return;
    }

    setError(null);
    setLoading(true);
    setProgressMsg('');
    setSteps(parsedSteps);

    try {
      const distanceM = stepsToMeters(parsedSteps, strideLength);
      const routeData = await getOptimizedRoute(
        startLocation,
        distanceM,
        routeType,
        strideLength,
        (n, max) => setProgressMsg(`Optimisation du parcours… (${n}/${max})`),
      );
      setRouteData(routeData);
      addToHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        routeType,
        steps: parsedSteps,
        distanceMeters: routeData.distanceMeters,
        geometry: routeData.geometry,
      });
      navigation.navigate('Map' as never);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? `Erreur : ${e.message}`
          : 'Une erreur est survenue lors de la génération',
      );
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  }

  // Texte de confirmation uniquement si adresse saisie (pas GPS brut)
  const addressConfirmText = addressLabel
    ? addressLabel.split(',').slice(0, 2).join(',')
    : null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: c.text }]}>StepRoute</Text>
        <Text style={[styles.subtitle, { color: c.subtext }]}>Transformez vos pas en parcours</Text>

        <View style={styles.section}>
          <Text style={[styles.label, { color: c.subtext }]}>Nombre de pas</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.card, color: c.text }]}
            value={stepsInput}
            onChangeText={setStepsInput}
            keyboardType="numeric"
            placeholder="ex. 10000"
            placeholderTextColor={c.muted}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: c.subtext }]}>Type de parcours</Text>
          <View style={[styles.segmented, { backgroundColor: c.segmentBg }]}>
            {ROUTE_TYPES.map((rt) => (
              <TouchableOpacity
                key={rt.value}
                style={[styles.segment, routeType === rt.value && { backgroundColor: c.card }]}
                onPress={() => setRouteType(rt.value)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: c.muted },
                    routeType === rt.value && { color: c.text, fontWeight: '600' },
                  ]}
                >
                  {rt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: c.subtext }]}>Point de départ</Text>

          {/* Bouton position — change d'état quand position récupérée */}
          <TouchableOpacity
            style={[
              styles.locationButton,
              usingCurrentLocation
                ? { backgroundColor: c.success }
                : { backgroundColor: c.card },
            ]}
            onPress={handleUseLocation}
          >
            <Text
              style={[
                styles.locationButtonText,
                { color: usingCurrentLocation ? '#fff' : c.accent },
              ]}
            >
              {usingCurrentLocation ? '✓ Position actuelle' : '📍 Utiliser ma position'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.orText, { color: c.muted }]}>ou</Text>

          <View style={styles.addressWrapper}>
            <View style={styles.addressRow}>
              <TextInput
                style={[styles.input, styles.addressInput, { backgroundColor: c.card, color: c.text }]}
                value={addressInput}
                onChangeText={handleAddressChange}
                placeholder="Rechercher une adresse..."
                placeholderTextColor={c.muted}
                returnKeyType="search"
                onSubmitEditing={handleSearchAddress}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchAddress}
                disabled={isGeocodingLoading}
              >
                {isGeocodingLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.searchArrow}>→</Text>
                )}
              </TouchableOpacity>
            </View>

            {suggestions.length > 0 && (
              <View style={[styles.suggestionsList, { backgroundColor: c.card }]}>
                {suggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.suggestionItem, i < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.separator }]}
                    onPress={() => handleSelectSuggestion(s)}
                  >
                    <Text style={[styles.suggestionText, { color: c.text }]} numberOfLines={2}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {addressConfirmText ? (
            <Text style={styles.locationConfirm} numberOfLines={1}>
              ✓ {addressConfirmText}
            </Text>
          ) : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.generateButton, isLoading && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Générer le parcours</Text>
          )}
        </TouchableOpacity>

        {isLoading && progressMsg ? (
          <Text style={[styles.progressMsg, { color: c.subtext }]}>{progressMsg}</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 4, marginTop: 40 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  section: { marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmented: { flexDirection: 'row', borderRadius: 10, padding: 3 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentText: { fontSize: 13, fontWeight: '500' },
  locationButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  locationButtonText: { fontSize: 15, fontWeight: '500' },
  orText: { textAlign: 'center', marginVertical: 10, fontSize: 13 },
  addressWrapper: { position: 'relative', zIndex: 10 },
  addressRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  addressInput: { flex: 1 },
  searchButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  searchArrow: { color: '#fff', fontSize: 18, lineHeight: 18, includeFontPadding: false },
  suggestionsList: {
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  suggestionItem: { paddingHorizontal: 16, paddingVertical: 12 },
  suggestionText: { fontSize: 14, lineHeight: 20 },
  locationConfirm: { marginTop: 8, color: '#27ae60', fontSize: 13, paddingHorizontal: 4 },
  error: { color: '#e74c3c', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  generateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonDisabled: { opacity: 0.6 },
  generateButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  progressMsg: { marginTop: 10, textAlign: 'center', fontSize: 13 },
});
