import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStore, ThemePreference } from '../store/useStore';
import { heightToStrideLength } from '../services/stepService';
import { getColors, useAppScheme } from '../theme';

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Système', value: 'system' },
  { label: 'Clair', value: 'light' },
  { label: 'Sombre', value: 'dark' },
];

export default function SettingsScreen() {
  const { heightCm, setHeightCm, themePreference, setThemePreference } = useStore();
  const [heightInput, setHeightInput] = useState(String(heightCm));

  const scheme = useAppScheme(themePreference);
  const c = getColors(scheme);
  const strideLength = heightToStrideLength(heightCm);

  function handleHeightChange(text: string) {
    setHeightInput(text);
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed) && parsed >= 100 && parsed <= 250) {
      setHeightCm(parsed);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.inner}>
      <Text style={[styles.title, { color: c.text }]}>Paramètres</Text>

      {/* Apparence */}
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Text style={[styles.sectionTitle, { color: c.muted }]}>Apparence</Text>
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.text }]}>Thème</Text>
          <View style={[styles.segmented, { backgroundColor: c.segmentBg }]}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segment, themePreference === opt.value && { backgroundColor: c.card }]}
                onPress={() => setThemePreference(opt.value)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: c.muted },
                    themePreference === opt.value && { color: c.text, fontWeight: '600' },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.cardGap} />

      {/* Profil */}
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Text style={[styles.sectionTitle, { color: c.muted }]}>Profil</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.text }]}>Taille</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { backgroundColor: c.cardAlt, color: c.text }]}
              value={heightInput}
              onChangeText={handleHeightChange}
              keyboardType="numeric"
              placeholder="170"
              placeholderTextColor={c.muted}
            />
            <Text style={[styles.unit, { color: c.subtext }]}>cm</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.separator }]} />

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.text }]}>Longueur de foulée calculée</Text>
          <Text style={styles.valueText}>{(strideLength * 100).toFixed(1)} cm</Text>
          <Text style={[styles.hint, { color: c.muted }]}>
            Calculée automatiquement depuis ta taille (taille × 0.413).
            Pour 10 000 pas → ~{((strideLength * 10000) / 1000).toFixed(1)} km.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, marginTop: 16 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardGap: { height: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  field: { marginBottom: 4 },
  label: { fontSize: 15, fontWeight: '500', marginBottom: 8 },
  segmented: { flexDirection: 'row', borderRadius: 10, padding: 3 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentText: { fontSize: 13, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    width: 100,
  },
  unit: { fontSize: 15 },
  valueText: { fontSize: 22, fontWeight: '600', color: '#4A90E2', marginBottom: 6 },
  hint: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginVertical: 16 },
});
