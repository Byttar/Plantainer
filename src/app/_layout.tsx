import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import AppTabs from '@/components/app-tabs';
import { TemperatureModal } from '@/components/temperature-modal';
import { Colors } from '@/constants/theme';
import { PlantsProvider, usePlants } from '@/context/plants-context';
import { useNotificationSync } from '@/hooks/use-notification-sync';
import { useNow } from '@/hooks/use-now';
import { toLocalDateKey } from '@/lib/local-date';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={theme}>
      <PlantsProvider>
        <AppStack />
      </PlantsProvider>
    </ThemeProvider>
  );
}

function AppStack() {
  const { loaded, temperatureHistory, recordTemperature } = usePlants();
  const now = useNow();
  useNotificationSync();
  const today = toLocalDateKey(now);
  const needsTemperature = !temperatureHistory.some((record) => record.date === today);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <AppTabs />
      <TemperatureModal
        key={today}
        visible={needsTemperature}
        onConfirm={(level) => recordTemperature(level, today)}
      />
    </>
  );
}
