import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { BottomSheet } from '@/components/bottom-sheet';
import { Icon } from '@/components/icon';
import { Colors, Spacing } from '@/constants/theme';
import { MIN_WATERINGS } from '@/lib/schedule';

type LearningInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Waterings recorded so far for the plant that opened this modal. */
  recorded?: number;
};

export function LearningInfoModal({ visible, onClose, recorded }: LearningInfoModalProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.iconCircle}>
        <Icon name="hourglass" size={28} color={Colors.primary} />
      </View>
      <AppText variant="heading" style={styles.centered}>
        Waiting more watering info
      </AppText>
      <AppText style={styles.centered} color={Colors.textMuted}>
        Every plant drinks at its own pace. To estimate when you should water this plant next, we
        need at least {MIN_WATERINGS} waterings recorded.
      </AppText>
      <AppText style={styles.centered} color={Colors.textMuted}>
        Just tap the plant and choose “Mark as watered” every time you water it. The schedule gets
        smarter with each watering.
      </AppText>
      {recorded !== undefined ? (
        <ProgressDots recorded={Math.min(recorded, MIN_WATERINGS)} />
      ) : null}
      <AppButton label="Got it" onPress={onClose} />
    </BottomSheet>
  );
}

export function ProgressDots({ recorded }: { recorded: number }) {
  return (
    <View style={styles.progress}>
      <View style={styles.dots}>
        {Array.from({ length: MIN_WATERINGS }, (_, index) => (
          <View key={index} style={[styles.dot, index < recorded && styles.dotFilled]}>
            {index < recorded ? <Icon name="water" size={14} color={Colors.textOnPrimary} /> : null}
          </View>
        ))}
      </View>
      <AppText variant="caption">
        {recorded} of {MIN_WATERINGS} waterings recorded
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  progress: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
});
