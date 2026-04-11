import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { HistoryEntry } from '../types';
import { getColors, useAppScheme } from '../theme';
import { useTranslation } from '../i18n';

function formatDistance(meters: number) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { history, setRouteData, themePreference } = useStore();
  const c = getColors(useAppScheme(themePreference));
  const insets = useSafeAreaInsets();
  const t = useTranslation();

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString(t.history.locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function handleSelectEntry(entry: HistoryEntry) {
    setRouteData({
      geometry: entry.geometry,
      distanceMeters: entry.distanceMeters,
      estimatedSteps: entry.steps,
    });
    navigation.navigate('Map' as never);
  }

  const header = (
    <Text style={[styles.title, { color: c.text, marginTop: insets.top + 8 }]}>{t.history.title}</Text>
  );

  if (history.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: c.bg }]}>
        {header}
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={[styles.emptyText, { color: c.subtext }]}>{t.history.empty}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.list, { backgroundColor: c.bg }]}
      contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
      data={history}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <TouchableOpacity style={[styles.item, { backgroundColor: c.card }]} onPress={() => handleSelectEntry(item)}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemDate, { color: c.subtext }]}>{formatDate(item.date)}</Text>
            <Text style={[styles.itemType, { color: c.accent }]}>
              {t.history.routeTypes[item.routeType] ?? item.routeType}
            </Text>
          </View>
          <View style={styles.itemStats}>
            <Text style={[styles.itemStat, { color: c.text }]}>{formatDistance(item.distanceMeters)}</Text>
            <Text style={[styles.itemStatSep, { color: c.muted }]}>·</Text>
            <Text style={[styles.itemStat, { color: c.text }]}>
              {item.steps.toLocaleString(t.history.locale)} {t.history.steps}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  item: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemDate: { fontSize: 13 },
  itemType: { fontSize: 13, fontWeight: '600' },
  itemStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemStat: { fontSize: 15, fontWeight: '600' },
  itemStatSep: { fontSize: 15 },
  separator: { height: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15 },
});
