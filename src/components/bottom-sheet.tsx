import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function BottomSheet({ visible, onClose, children, footer }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [footerHeight, setFooterHeight] = useState(0);
  const isWeb = Platform.OS === 'web';
  const maxSheetHeight = Math.max(0, height - insets.top - Spacing.four);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isWeb ? 'fade' : 'none'}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View entering={isWeb ? undefined : FadeIn.duration(180)} style={styles.backdrop}>
          <Pressable style={styles.backdropPressable} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View
          entering={
            isWeb ? undefined : SlideInDown.duration(260).easing(Easing.out(Easing.cubic))
          }
          style={[
            styles.sheet,
            {
              maxHeight: maxSheetHeight,
              paddingBottom: footer ? footerHeight : 0,
            },
          ]}>
          <View style={styles.handle} />
          <ScrollView
            style={styles.scroll}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.body,
              { paddingBottom: footer ? Spacing.three : insets.bottom + Spacing.four },
            ]}>
            {children}
          </ScrollView>
          {footer ? (
            <View
              onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
              style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg + 4,
    borderTopRightRadius: Radius.lg + 4,
    paddingTop: Spacing.two,
    overflow: 'hidden',
  },
  scroll: {
    flexShrink: 1,
  },
  body: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
    marginBottom: Spacing.three,
  },
});
