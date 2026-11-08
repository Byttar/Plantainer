import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { TemperatureByLevel, TemperatureSteps } from '@/constants/temperature';
import { Colors, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import type { TemperatureLevel } from '@/types/plant';

type TemperatureModalProps = {
  visible: boolean;
  onConfirm: (level: TemperatureLevel) => void;
};

export function TemperatureModal({ visible, onConfirm }: TemperatureModalProps) {
  const [level, setLevel] = useState<TemperatureLevel>(3);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <AppText variant="heading" style={styles.centered}>
            How is the temperature today?
          </AppText>
          <AppText color={Colors.textMuted} style={styles.centered}>
            This helps adjust watering suggestions for your plants.
          </AppText>

          <View style={styles.value}>
            <Icon
              name={TemperatureByLevel[level].icon}
              size={40}
              color={TemperatureByLevel[level].color}
            />
            <AppText variant="bodyBold" color={TemperatureByLevel[level].color}>
              {TemperatureByLevel[level].label}
            </AppText>
          </View>

          <View style={styles.iconRow}>
            {TemperatureSteps.map((step) => {
              const active = step.level === level;
              return (
                <View
                  key={step.level}
                  style={[
                    styles.iconStep,
                    !active && styles.iconStepInactive,
                    active && { backgroundColor: `${step.color}22` },
                  ]}>
                  <Icon
                    name={step.icon}
                    size={active ? 28 : 22}
                    color={step.color}
                  />
                </View>
              );
            })}
          </View>

          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={level}
            minimumTrackTintColor={TemperatureByLevel[level].color}
            maximumTrackTintColor={Colors.border}
            thumbTintColor={TemperatureByLevel[level].color}
            accessibilityLabel="Today's temperature"
            accessibilityValue={{
              min: 1,
              max: 5,
              now: level,
              text: TemperatureByLevel[level].label,
            }}
            onValueChange={(value) => setLevel(Math.round(value) as TemperatureLevel)}
          />

          <View style={styles.scaleLabels}>
            <AppText variant="caption">Really cold</AppText>
            <AppText variant="caption">Really hot</AppText>
          </View>

          <AppButton label="Save temperature" onPress={() => onConfirm(level)} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: Math.min(MaxContentWidth, 440),
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.four,
    gap: Spacing.three,
    ...Shadow,
  },
  centered: {
    textAlign: 'center',
  },
  value: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.one,
  },
  iconStep: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStepInactive: {
    opacity: 0.4,
  },
  slider: {
    width: '100%',
    height: 44,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -Spacing.three,
  },
});
