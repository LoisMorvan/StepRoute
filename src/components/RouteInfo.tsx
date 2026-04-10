import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteData } from '../types';
import { getColors, useAppScheme } from '../theme';
import { useStore } from '../store/useStore';

interface Props {
  routeData: RouteData;
}

export default function RouteInfo({ routeData }: Props) {
  const { themePreference } = useStore();
  const c = getColors(useAppScheme(themePreference));
  const km = (routeData.distanceMeters / 1000).toFixed(2);
  return (
    <View style={[styles.container, { backgroundColor: c.card }]}>
      <Text style={[styles.text, { color: c.text }]}>
        {km} km · ~{routeData.estimatedSteps.toLocaleString()} pas
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  text: { fontSize: 16, fontWeight: '600' },
});
