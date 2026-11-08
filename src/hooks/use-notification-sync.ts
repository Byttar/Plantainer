import { useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { usePlants } from '@/context/plants-context';
import { reconcilePlantNotifications } from '@/lib/notifications';

export function useNotificationSync() {
  const { loaded, plants, temperatureHistory, notificationSettings } = usePlants();

  const synchronize = useCallback(() => {
    if (!loaded || Platform.OS === 'web') return;
    reconcilePlantNotifications(plants, temperatureHistory, notificationSettings).catch(() => {});
  }, [loaded, notificationSettings, plants, temperatureHistory]);

  useEffect(() => {
    synchronize();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') synchronize();
    });
    return () => subscription.remove();
  }, [synchronize]);
}
