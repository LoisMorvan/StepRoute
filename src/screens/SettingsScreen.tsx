import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore, ThemePreference } from '../store/useStore';
import { heightToStrideLength } from '../services/stepService';
import { getColors, useAppScheme } from '../theme';
import { useTranslation, Language } from '../i18n';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {
    heightCm, setHeightCm,
    themePreference, setThemePreference,
    language, setLanguage,
    avoidHighways, setAvoidHighways,
    preferGreen, setPreferGreen,
  } = useStore();
  const [heightInput, setHeightInput] = useState(String(heightCm));

  const scheme = useAppScheme(themePreference);
  const c = getColors(scheme);
  const strideLength = heightToStrideLength(heightCm);
  const t = useTranslation();

  const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
    { label: t.settings.themes.system, value: 'system' },
    { label: t.settings.themes.light, value: 'light' },
    { label: t.settings.themes.dark, value: 'dark' },
  ];

  const LANGUAGE_OPTIONS: { label: string; value: Language }[] = [
    { label: t.settings.languages.en, value: 'en' },
    { label: t.settings.languages.fr, value: 'fr' },
  ];

  function handleHeightChange(text: string) {
    setHeightInput(text);
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed) && parsed >= 100 && parsed <= 250) {
      setHeightCm(parsed);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.inner}>
      <Text style={[styles.title, { color: c.text }]}>{t.settings.title}</Text>

      {/* Appearance */}
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Text style={[styles.sectionTitle, { color: c.muted }]}>{t.settings.appearance}</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.text }]}>{t.settings.theme}</Text>
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

        <View style={[styles.divider, { backgroundColor: c.separator }]} />

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.text }]}>{t.settings.language}</Text>
          <View style={[styles.segmented, { backgroundColor: c.segmentBg }]}>
            {LANGUAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segment, language === opt.value && { backgroundColor: c.card }]}
                onPress={() => setLanguage(opt.value)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: c.muted },
                    language === opt.value && { color: c.text, fontWeight: '600' },
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

      {/* Profile */}
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Text style={[styles.sectionTitle, { color: c.muted }]}>{t.settings.profile}</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.text }]}>{t.settings.height}</Text>
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
          <Text style={[styles.label, { color: c.text }]}>{t.settings.strideLength}</Text>
          <Text style={styles.valueText}>{(strideLength * 100).toFixed(1)} cm</Text>
          <Text style={[styles.hint, { color: c.muted }]}>
            {t.settings.strideHint(((strideLength * 10000) / 1000).toFixed(1))}
          </Text>
        </View>
      </View>

      <View style={styles.cardGap} />

      {/* Route preferences */}
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Text style={[styles.sectionTitle, { color: c.muted }]}>{t.settings.parcours}</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.text }]}>{t.settings.avoidHighways}</Text>
          <View style={[styles.segmented, { backgroundColor: c.segmentBg }]}>
            {([false, true] as const).map((val) => (
              <TouchableOpacity
                key={String(val)}
                style={[styles.segment, avoidHighways === val && { backgroundColor: c.card }]}
                onPress={() => setAvoidHighways(val)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: c.muted },
                    avoidHighways === val && { color: c.text, fontWeight: '600' },
                  ]}
                >
                  {val ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.separator }]} />

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.text }]}>{t.settings.preferGreen}</Text>
          <View style={[styles.segmented, { backgroundColor: c.segmentBg }]}>
            {([false, true] as const).map((val) => (
              <TouchableOpacity
                key={String(val)}
                style={[styles.segment, preferGreen === val && { backgroundColor: c.card }]}
                onPress={() => setPreferGreen(val)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: c.muted },
                    preferGreen === val && { color: c.text, fontWeight: '600' },
                  ]}
                >
                  {val ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.cardGap} />

      {/* Legal */}
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Text style={[styles.sectionTitle, { color: c.muted }]}>{t.settings.legal}</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('PrivacyPolicy' as never)}
        >
          <Text style={[styles.linkText, { color: c.text }]}>{t.settings.privacyPolicy}</Text>
          <Text style={[styles.chevron, { color: c.muted }]}>›</Text>
        </TouchableOpacity>
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
  valueText: { fontSize: 22, fontWeight: '600', color: '#5DBE4A', marginBottom: 6 },
  hint: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginVertical: 16 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  linkText: { fontSize: 15, fontWeight: '500' },
  chevron: { fontSize: 20, lineHeight: 22 },
});
