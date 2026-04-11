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
    bg: dark ? '#0F1A24' : '#f2f7f2',
    card: dark ? '#182333' : '#fff',
    cardAlt: dark ? '#1E2D3F' : '#eef5ee',
    text: dark ? '#f0f0f0' : '#1a1a1a',
    subtext: dark ? '#8AAFC0' : '#5a7a65',
    muted: dark ? '#4A6275' : '#9ab5a0',
    border: dark ? '#1E2D3F' : '#d8ead8',
    separator: dark ? '#1E2D3F' : '#e4f0e4',
    segmentBg: dark ? '#1E2D3F' : '#dceadc',
    tabBar: dark ? '#182333' : '#fff',
    tabBarBorder: dark ? '#1E2D3F' : '#d8ead8',
    accent: '#5DBE4A',
    success: '#3DAF6A',
    danger: '#e74c3c',
  };
}
