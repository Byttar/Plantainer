import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { BottomSheet } from '@/components/bottom-sheet';
import { CareReminderForm } from '@/components/care-reminder-form';
import { Icon } from '@/components/icon';
import { ProgressDots } from '@/components/learning-info-modal';
import { PlantIcon } from '@/components/plant-icon';
import { StatusBadge } from '@/components/status-badge';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePlants } from '@/context/plants-context';
import {
  formatFertilizerReminder,
  formatPestReminder,
  reminderDaysRemaining,
} from '@/lib/care-reminders';
import { formatDate, formatInterval, formatLastWatered, formatNextWatering } from '@/lib/format';
import { getSchedule, MIN_WATERINGS } from '@/lib/schedule';
import type { CareReminder, Plant, ReminderIntervalUnit } from '@/types/plant';

type PlantDetailsModalProps = {
  plant: Plant | null;
  now: number;
  onClose: () => void;
};

type ReminderEditor = 'pest' | 'fertilizer';

export function PlantDetailsModal({ plant, now, onClose }: PlantDetailsModalProps) {
  const { waterPlant, setPestReminder, setFertilizerReminder } = usePlants();
  const [editor, setEditor] = useState<ReminderEditor | null>(null);

  const close = () => {
    setEditor(null);
    onClose();
  };

  return (
    <BottomSheet
      visible={plant !== null}
      onClose={close}
      footer={
        plant && editor === null ? (
          <AppButton
            label="Mark as watered"
            icon={<Icon name="water" size={18} color={Colors.textOnPrimary} />}
            onPress={() => {
              waterPlant(plant.id);
              close();
            }}
          />
        ) : undefined
      }>
      {plant && editor ? (
        <CareReminderForm
          key={`${plant.id}-${editor}`}
          kind={editor}
          initial={editor === 'pest' ? plant.pestReminder : plant.fertilizerReminder}
          onCancel={() => setEditor(null)}
          onSave={(input) => {
            if (editor === 'pest') {
              setPestReminder(plant.id, {
                title: input.title,
                intervalValue: input.intervalValue,
              });
            } else {
              setFertilizerReminder(plant.id, input);
            }
            setEditor(null);
          }}
        />
      ) : plant ? (
        <PlantDetails
          key={plant.id}
          plant={plant}
          now={now}
          onClose={close}
          onEditReminder={setEditor}
        />
      ) : null}
    </BottomSheet>
  );
}

function PlantDetails({
  plant,
  now,
  onClose,
  onEditReminder,
}: PlantDetailsModalProps & {
  plant: Plant;
  onEditReminder: (kind: ReminderEditor) => void;
}) {
  const {
    temperatureHistory,
    undoLastWatering,
    reapplyPestTreatment,
    reapplyFertilizer,
    removePestReminder,
    removeFertilizerReminder,
    removePlant,
  } = usePlants();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const schedule = getSchedule(plant, now, temperatureHistory);
  const recent = plant.waterings.slice(-4).reverse();

  return (
    <>
      <View style={styles.header}>
        <View style={styles.iconBubble}>
          <PlantIcon icon={plant.icon} size={42} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="heading" numberOfLines={2}>
            {plant.name}
          </AppText>
          <StatusBadge
            status={schedule.status}
            shouldWaterEarly={schedule.shouldWaterEarly}
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <InfoRow label="Last watering" value={formatLastWatered(schedule.lastWatered, now)} />
        {schedule.nextWatering !== null && schedule.interval !== null ? (
          <>
            <InfoRow label="Next watering" value={formatNextWatering(schedule.nextWatering, now)} />
            <InfoRow label="Rhythm" value={formatInterval(schedule.interval)} />
          </>
        ) : (
          <>
            <AppText variant="caption" style={styles.learningText}>
              We need at least {MIN_WATERINGS} waterings to estimate when this plant should be
              watered next.
            </AppText>
            <ProgressDots recorded={plant.waterings.length} />
          </>
        )}
      </View>

      {schedule.shouldWaterEarly && schedule.normalNextWatering !== null ? (
        <View style={styles.earlyWarning}>
          <View style={styles.warningTitle}>
            <Icon name="warning" size={20} color={Colors.warning} />
            <AppText variant="bodyBold" color={Colors.warning}>
              Watering suggested early
            </AppText>
          </View>
          <AppText variant="caption">
            Recent warmer temperatures moved this suggestion about{' '}
            {formatAdjustment(schedule.temperatureAdjustment)} earlier than the usual schedule. Based
            only on its watering rhythm, it would be time to{' '}
            {formatNextWatering(schedule.normalNextWatering, now).toLowerCase()}.
          </AppText>
        </View>
      ) : null}

      {__DEV__ &&
      schedule.shouldWaterEarly &&
      schedule.lastWatered !== null &&
      schedule.interval !== null &&
      schedule.wateringScore !== null ? (
        <DevWateringCalculation
          elapsed={now - schedule.lastWatered}
          interval={schedule.interval}
          temperatureAdjustment={schedule.temperatureAdjustment}
          temperatureRecordsUsed={schedule.temperatureRecordsUsed}
          score={schedule.wateringScore}
        />
      ) : null}

      <View style={styles.careSection}>
        <AppText variant="label" color={Colors.textMuted}>
          CARE REMINDERS
        </AppText>

        {plant.pestReminder ? (
          <ReminderCard
            kind="pest"
            reminder={plant.pestReminder}
            now={now}
            onApplied={() => reapplyPestTreatment(plant.id)}
            onEdit={() => onEditReminder('pest')}
            onRemove={() => removePestReminder(plant.id)}
          />
        ) : (
          <AppButton
            label="Add pest medicine reminder"
            variant="secondary"
            icon={<Icon name="pest" size={18} color={Colors.primaryDark} />}
            onPress={() => onEditReminder('pest')}
          />
        )}

        {plant.fertilizerReminder ? (
          <ReminderCard
            kind="fertilizer"
            reminder={plant.fertilizerReminder}
            now={now}
            onApplied={() => reapplyFertilizer(plant.id)}
            onEdit={() => onEditReminder('fertilizer')}
            onRemove={() => removeFertilizerReminder(plant.id)}
          />
        ) : (
          <AppButton
            label="Add fertilizing reminder"
            variant="secondary"
            icon={<Icon name="fertilizer" size={18} color={Colors.primaryDark} />}
            onPress={() => onEditReminder('fertilizer')}
          />
        )}
      </View>

      {recent.length > 0 ? (
        <View style={styles.history}>
          <AppText variant="label" color={Colors.textMuted}>
            RECENT WATERINGS
          </AppText>
          {recent.map((time) => (
            <View key={time} style={styles.historyRow}>
              <Icon name="water" size={14} color={Colors.primary} />
              <AppText variant="caption">{formatDate(time)}</AppText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.secondaryActions}>
        {plant.waterings.length > 0 ? (
          <AppButton
            label="Undo last"
            variant="ghost"
            icon={<Icon name="undo" size={16} color={Colors.textMuted} />}
            onPress={() => undoLastWatering(plant.id)}
          />
        ) : null}
        <AppButton
          label={confirmRemove ? 'Tap again to remove' : 'Remove'}
          variant={confirmRemove ? 'danger' : 'ghost'}
          icon={<Icon name="trash" size={16} color={confirmRemove ? Colors.danger : Colors.textMuted} />}
          onPress={() => {
            if (!confirmRemove) {
              setConfirmRemove(true);
              return;
            }
            removePlant(plant.id);
            onClose();
          }}
        />
      </View>
    </>
  );
}

type ReminderCardProps = {
  kind: ReminderEditor;
  reminder: CareReminder;
  now: number;
  onApplied: () => void;
  onEdit: () => void;
  onRemove: () => void;
};

function ReminderCard({
  kind,
  reminder,
  now,
  onApplied,
  onEdit,
  onRemove,
}: ReminderCardProps) {
  const isDue = reminderDaysRemaining(reminder, now) <= 0;
  const summary =
    kind === 'pest'
      ? formatPestReminder(reminder, now)
      : formatFertilizerReminder(reminder, now);

  return (
    <View style={[styles.reminderCard, isDue && styles.reminderCardDue]}>
      <View style={styles.reminderHeading}>
        <View style={[styles.reminderIcon, isDue && styles.reminderIconDue]}>
          <Icon
            name={kind === 'pest' ? 'pest' : 'fertilizer'}
            size={20}
            color={isDue ? Colors.warning : Colors.primaryDark}
          />
        </View>
        <View style={styles.reminderHeadingText}>
          <AppText variant="bodyBold">
            {kind === 'pest' ? 'Pest medicine' : 'Fertilizer'} · {reminder.title}
          </AppText>
          <AppText variant="caption" color={isDue ? Colors.warning : Colors.text}>
            {summary}
          </AppText>
        </View>
      </View>

      <View style={styles.reminderMeta}>
        <AppText variant="label" color={Colors.textMuted}>
          EVERY {formatReminderInterval(reminder.intervalValue, reminder.intervalUnit).toUpperCase()}
        </AppText>
        <AppText variant="label" color={Colors.textMuted}>
          NEXT · {formatDate(reminder.nextDueAt)}
        </AppText>
      </View>

      <View style={styles.reminderActions}>
        <AppButton label="Applied now" variant="secondary" onPress={onApplied} />
        <AppButton label="Edit" variant="ghost" onPress={onEdit} />
        <AppButton label="Remove" variant="danger" onPress={onRemove} />
      </View>
    </View>
  );
}

function formatReminderInterval(value: number, unit: ReminderIntervalUnit) {
  const singular = unit === 'days' ? 'day' : 'month';
  return `${value} ${value === 1 ? singular : `${singular}s`}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="bodyBold">{value}</AppText>
    </View>
  );
}

function formatAdjustment(milliseconds: number) {
  const hours = Math.max(1, Math.round(milliseconds / (60 * 60 * 1000)));
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

function formatHours(milliseconds: number) {
  const hours = milliseconds / (60 * 60 * 1000);
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

type DevWateringCalculationProps = {
  elapsed: number;
  interval: number;
  temperatureAdjustment: number;
  temperatureRecordsUsed: number;
  score: number;
};

function DevWateringCalculation({
  elapsed,
  interval,
  temperatureAdjustment,
  temperatureRecordsUsed,
  score,
}: DevWateringCalculationProps) {
  const effectiveElapsed = elapsed + temperatureAdjustment;
  const scoreText = `${score >= 0 ? '+' : ''}${score.toFixed(2)}`;

  return (
    <View style={styles.devCalculation}>
      <View style={styles.devHeading}>
        <AppText variant="label" color={Colors.primaryDark}>
          DEV · WATERING CALCULATION
        </AppText>
        <AppText variant="label" color={Colors.warning}>
          EARLY
        </AppText>
      </View>

      <AppText variant="caption">
        Hot days make time count faster. Each “really hot” record contributes 25% of one day
        (6h) toward the plant’s learned watering rhythm.
      </AppText>

      <View style={styles.formulaLine}>
        <FormulaValue label="Elapsed" value={formatHours(elapsed)} />
        <FormulaOperator>+</FormulaOperator>
        <FormulaValue
          label={`Weather · ${temperatureRecordsUsed}`}
          value={formatHours(temperatureAdjustment)}
        />
        <FormulaOperator>=</FormulaOperator>
        <FormulaValue label="Effective" value={formatHours(effectiveElapsed)} emphasized />
      </View>

      <View style={styles.formulaLine}>
        <FormulaValue label="Effective" value={formatHours(effectiveElapsed)} />
        <FormulaOperator>÷</FormulaOperator>
        <FormulaValue label="Rhythm" value={formatHours(interval)} />
        <FormulaOperator>− 1 =</FormulaOperator>
        <FormulaValue label="Score" value={scoreText} emphasized />
      </View>

      <View style={styles.devResult}>
        <Icon name="warning" size={16} color={Colors.warning} />
        <AppText variant="caption" style={styles.devResultText}>
          {scoreText} ≥ 0, so the effective elapsed time has reached the learned rhythm even though
          the normal due time has not. Suggest watering early.
        </AppText>
      </View>
    </View>
  );
}

function FormulaValue({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={[styles.formulaValue, emphasized && styles.formulaValueEmphasized]}>
      <AppText variant="label" color={Colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="bodyBold" color={emphasized ? Colors.primaryDark : Colors.text}>
        {value}
      </AppText>
    </View>
  );
}

function FormulaOperator({ children }: { children: string }) {
  return (
    <AppText variant="bodyBold" color={Colors.textMuted} style={styles.formulaOperator}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  iconBubble: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: Colors.backgroundSoft,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  learningText: {
    textAlign: 'center',
  },
  earlyWarning: {
    backgroundColor: Colors.warningSoft,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warning,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  warningTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  devCalculation: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  devHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  formulaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  formulaValue: {
    minWidth: 68,
    alignItems: 'center',
    backgroundColor: Colors.backgroundSoft,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  formulaValueEmphasized: {
    backgroundColor: Colors.primarySoft,
  },
  formulaOperator: {
    minWidth: 24,
    textAlign: 'center',
  },
  devResult: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    backgroundColor: Colors.warningSoft,
    borderRadius: Radius.sm,
    padding: Spacing.two,
  },
  devResultText: {
    flex: 1,
  },
  careSection: {
    gap: Spacing.two,
  },
  reminderCard: {
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  reminderCardDue: {
    backgroundColor: Colors.warningSoft,
    borderColor: Colors.warning,
  },
  reminderHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  reminderHeadingText: {
    flex: 1,
    gap: Spacing.half,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  reminderIconDue: {
    backgroundColor: Colors.warningSoft,
  },
  reminderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  history: {
    gap: Spacing.one,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
