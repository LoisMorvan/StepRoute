import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import MapScreen from './src/screens/MapScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { getColors, useAppScheme } from './src/theme';
import { useStore } from './src/store/useStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { themePreference } = useStore();
  const scheme = useAppScheme(themePreference);
  const c = getColors(scheme);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.tabBar, borderTopColor: c.tabBarBorder },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🗺️</Text> }}
      />
      <Tab.Screen
        name="Historique"
        component={HistoryScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text> }}
      />
      <Tab.Screen
        name="Paramètres"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚙️</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { themePreference } = useStore();
  const scheme = useAppScheme(themePreference);
  return (
    <NavigationContainer>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
