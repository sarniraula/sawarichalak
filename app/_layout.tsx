import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { prewarmAllCountries } from '@/services/countryContent';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useRootNavigationState, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { themePreference } = useThemeStore();
  const colorScheme =
    themePreference === 'system' ? (systemScheme ?? 'light') : themePreference;
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Best-effort cache fill for offline mode.
    prewarmAllCountries().catch(() => {});
  }, []);

  useEffect(() => {
    if (themePreference === 'system') {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(themePreference);
    }
  }, [themePreference]);

  const inAuthGroup = segments[0] === '(auth)';

  const navReady = !!navigationState?.key;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      {navReady && !isAuthenticated && !inAuthGroup ? <Redirect href="/(auth)/login" /> : null}
      {navReady && isAuthenticated && inAuthGroup ? <Redirect href="/(tabs)" /> : null}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
