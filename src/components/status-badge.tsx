import { Platform, Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import type { IconName } from '@/components/icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { PlantStatus } from '@/lib/schedule';

export const StatusStyles: Record<
  PlantStatus,
  { label: string; icon: IconName; color: string; background: string }
> = {
  atRisk: { label: 'At risk', icon: 'danger', color: Colors.danger, background: Colors.dangerSoft },
  needsWater: {
    label: 'Needs water',
    icon: 'warning',
    color: Colors.warning,
    background: Colors.warningSoft,
  },
  ok: { label: 'Happy', icon: 'check', color: Colors.primary, background: Colors.primarySoft },
  learning: {
    label: 'Waiting more watering info',
    icon: 'hourglass',
    color: Colors.neutral,
    background: Colors.neutralSoft,
  },
};

type StatusBadgeProps = {
  status: PlantStatus;
  shouldWaterEarly?: boolean;
  onPress?: () => void;
};

export function StatusBadge({ status, shouldWaterEarly = false, onPress }: StatusBadgeProps) {
  const { label, color, background } = StatusStyles[status];
  const displayLabel = shouldWaterEarly ? `${label} · Water early` : label;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={8}
      // On web, role="button" renders a <button>, which can't be nested inside the card's <button>.
      accessibilityRole={onPress && Platform.OS !== 'web' ? 'button' : undefined}
      style={({ pressed }) => [
        styles.badge,
        { backgroundColor: background, borderColor: color },
        pressed && styles.pressed,
      ]}>
      <AppText variant="label" color={color} numberOfLines={2} style={styles.text}>
        {displayLabel}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one - 2,
    borderRadius: Radius.pill,
    flexShrink: 1,
  },
  text: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
