import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { PlantIcon } from '@/components/plant-icon';
import { StatusBadge, StatusStyles } from '@/components/status-badge';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import {
  formatFertilizerReminder,
  formatPestReminder,
  isReminderCurrent,
  reminderDaysRemaining,
} from '@/lib/care-reminders';
import { formatLastWatered, formatNextWatering } from '@/lib/format';
import type { PlantSchedule } from '@/lib/schedule';
import type { Plant, ViewMode } from '@/types/plant';

type PlantCardProps = {
  plant: Plant;
  schedule: PlantSchedule;
  now: number;
  variant: ViewMode;
  onPress: () => void;
  onLearningPress: () => void;
};

export function PlantCard({
  plant,
  schedule,
  now,
  variant,
  onPress,
  onLearningPress,
}: PlantCardProps) {
  const isUrgent = schedule.status === 'needsWater' || schedule.status === 'atRisk';
  const statusStyle = StatusStyles[schedule.status];
  const isGrid = variant === 'grid';
  const fertilizerSummary = plant.fertilizerReminder
    ? formatFertilizerReminder(plant.fertilizerReminder, now)
    : null;
  const pestSummary = plant.pestReminder ? formatPestReminder(plant.pestReminder, now) : null;
  const isPestTreatmentDue =
    plant.pestReminder !== undefined && reminderDaysRemaining(plant.pestReminder, now) <= 0;
  const isFertilized =
    plant.fertilizerReminder !== undefined &&
    isReminderCurrent(plant.fertilizerReminder, now);

  const badge = (
    <StatusBadge
      status={schedule.status}
      shouldWaterEarly={schedule.shouldWaterEarly}
      onPress={schedule.status === 'learning' ? onLearningPress : undefined}
    />
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${plant.name}, ${statusStyle.label}${
        schedule.shouldWaterEarly ? ', early watering suggested because of recent temperatures' : ''
      }${fertilizerSummary ? `, ${fertilizerSummary}` : ''}${
        pestSummary ? `, ${pestSummary}` : ''
      }`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isGrid ? styles.gridCard : styles.listCard,
        isUrgent && { borderColor: statusStyle.color, backgroundColor: statusStyle.background },
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.iconBubble,
          isGrid && styles.iconBubbleLarge,
          isUrgent && { backgroundColor: Colors.surface },
        ]}>
        <PlantIcon icon={plant.icon} size={isGrid ? 42 : 32} />
      </View>

      <View style={isGrid ? styles.infoGrid : styles.info}>
        <AppText
          variant="heading"
          numberOfLines={1}
          style={[styles.name, isGrid && styles.nameGrid]}>
          {plant.name}
        </AppText>
        <AppText variant="caption" numberOfLines={1} style={isGrid && styles.centered}>
          {formatLastWatered(schedule.lastWatered, now)}
        </AppText>
        {schedule.nextWatering !== null ? (
          <AppText
            variant="caption"
            numberOfLines={1}
            color={isUrgent ? statusStyle.color : undefined}
            style={isGrid && styles.centered}>
            {formatNextWatering(schedule.nextWatering, now)}
          </AppText>
        ) : null}
        {fertilizerSummary ? (
          <AppText
            variant="caption"
            numberOfLines={isGrid ? 2 : 1}
            color={isFertilized ? Colors.primaryDark : Colors.warning}
            style={isGrid && styles.centered}>
            {fertilizerSummary}
          </AppText>
        ) : null}
        {pestSummary && isPestTreatmentDue ? (
          <AppText
            variant="caption"
            numberOfLines={isGrid ? 2 : 1}
            color={Colors.warning}
            style={isGrid && styles.centered}>
            {pestSummary}
          </AppText>
        ) : null}
        <View style={[styles.badgeRow, isGrid && styles.badgeRowGrid]}>
          {badge}
          {isFertilized ? (
            <View style={styles.fertilizedBadge}>
              <AppText variant="label" color={Colors.primaryDark}>
                Fertilized
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md + 4,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  gridCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  infoGrid: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: Spacing.half,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
  },
  nameGrid: {
    textAlign: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  badgeRowGrid: {
    justifyContent: 'center',
  },
  fertilizedBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one - 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primarySoft,
  },
});
