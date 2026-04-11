import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getColors, useAppScheme } from '../theme';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const { themePreference } = useStore();
  const scheme = useAppScheme(themePreference);
  const c = getColors(scheme);
  const t = useTranslation();

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.inner}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={[styles.backText, { color: c.accent }]}>← {t.settings.privacyPolicy}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: c.text }]}>{t.privacy.title}</Text>
      <Text style={[styles.lastUpdated, { color: c.muted }]}>{t.privacy.lastUpdated}</Text>

      {t.privacy.sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={[styles.heading, { color: c.text }]}>{section.heading}</Text>
          <Text style={[styles.body, { color: c.subtext }]}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 24, paddingBottom: 48 },
  backButton: { marginBottom: 16, marginTop: 8 },
  backText: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  lastUpdated: { fontSize: 13, marginBottom: 28 },
  section: { marginBottom: 22 },
  heading: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  body: { fontSize: 14, lineHeight: 21 },
});
