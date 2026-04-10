import { ColorSchemeName, useColorScheme } from 'react-native';
import { ThemePreference } from './store/useStore';

export function useAppScheme(preference: ThemePreference): ColorSchemeName {
  const systemScheme = useColorScheme();
  if (preference === 'system') return systemScheme;
  return preference;
}

export function getColors(scheme: ColorSchemeName) {
  const dark = scheme === 'dark';
  return {
    bg: dark ? '#111' : '#f5f5f5',
    card: dark ? '#1e1e1e' : '#fff',
    cardAlt: dark ? '#2a2a2a' : '#f5f5f5',
    text: dark ? '#f0f0f0' : '#1a1a1a',
    subtext: dark ? '#999' : '#888',
    muted: dark ? '#555' : '#aaa',
    border: dark ? '#333' : '#eee',
    separator: dark ? '#2a2a2a' : '#f0f0f0',
    segmentBg: dark ? '#2a2a2a' : '#e8e8e8',
    tabBar: dark ? '#1e1e1e' : '#fff',
    tabBarBorder: dark ? '#333' : '#eee',
    accent: '#4A90E2',
    success: '#27ae60',
    danger: '#e74c3c',
  };
}
