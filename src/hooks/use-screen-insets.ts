import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IOS_TAB_BAR_HEIGHT = 50;

/**
 * Insets for tab screens. On iOS the tab bar floats over the content and the first scroll view
 * adjusts its insets automatically; on Android and web the screen already ends above the tab bar.
 */
export function useScreenInsets() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'ios') {
    return { top: 0, floatingBottom: insets.bottom + IOS_TAB_BAR_HEIGHT };
  }
  return { top: insets.top, floatingBottom: 0 };
}
