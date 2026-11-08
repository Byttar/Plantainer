import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { CareReminder, ReminderIntervalUnit } from '@/types/plant';

type ReminderKind = 'pest' | 'fertilizer';

type CareReminderFormProps = {
  kind: ReminderKind;
  initial?: CareReminder;
  onSave: (input: {
    title: string;
    intervalValue: number;
    intervalUnit: ReminderIntervalUnit;
  }) => void;
  onCancel: () => void;
};

const copy = {
  pest: {
    heading: 'Pest medicine reminder',
    nameLabel: 'PEST CONTROL TITLE',
    placeholder: 'e.g. Neem oil',
    intervalLabel: 'APPLY AGAIN AFTER',
    icon: 'pest',
  },
  fertilizer: {
    heading: 'Fertilizing reminder',
    nameLabel: 'FERTILIZER NAME',
    placeholder: 'e.g. Liquid seaweed',
    intervalLabel: 'FERTILIZE AGAIN AFTER',
    icon: 'fertilizer',
  },
} as const;

export function CareReminderForm({
  kind,
  initial,
  onSave,
  onCancel,
}: CareReminderFormProps) {
  const content = copy[kind];
  const [title, setTitle] = useState(initial?.title ?? '');
  const [intervalText, setIntervalText] = useState(String(initial?.intervalValue ?? ''));
  const [unit, setUnit] = useState<ReminderIntervalUnit>(
    kind === 'pest' ? 'days' : (initial?.intervalUnit ?? 'days'),
  );

  const intervalValue = Number(intervalText);
  const maximum = kind === 'fertilizer' ? (unit === 'days' ? 30 : 12) : Number.MAX_SAFE_INTEGER;
  const intervalIsValid =
    Number.isInteger(intervalValue) && intervalValue >= 1 && intervalValue <= maximum;
  const canSave = title.trim().length > 0 && intervalIsValid;

  return (
    <>
      <View style={styles.heading}>
        <View style={styles.headingIcon}>
          <Icon name={content.icon} size={24} color={Colors.primaryDark} />
        </View>
        <View style={styles.headingText}>
          <AppText variant="heading">{content.heading}</AppText>
          <AppText variant="caption" color={Colors.textMuted}>
            The countdown starts from the last application date.
          </AppText>
        </View>
      </View>

      <View style={styles.field}>
        <AppText variant="label" color={Colors.textMuted}>
          {content.nameLabel}
        </AppText>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={content.placeholder}
          placeholderTextColor={Colors.neutral}
          style={styles.input}
          autoFocus
          maxLength={50}
          returnKeyType="next"
        />
      </View>

      <View style={styles.field}>
        <AppText variant="label" color={Colors.textMuted}>
          {content.intervalLabel}
        </AppText>
        <View style={styles.intervalRow}>
          <TextInput
            accessibilityLabel="Reminder interval"
            value={intervalText}
            onChangeText={(value) => setIntervalText(value.replace(/\D/g, ''))}
            placeholder="7"
            placeholderTextColor={Colors.neutral}
            style={[styles.input, styles.numberInput]}
            keyboardType="number-pad"
            maxLength={kind === 'pest' ? 4 : 2}
          />
          {kind === 'pest' ? (
            <View style={[styles.unitOption, styles.unitOptionSelected]}>
              <AppText variant="bodyBold" color={Colors.primaryDark}>
                Days
              </AppText>
            </View>
          ) : (
            <View style={styles.unitSelector}>
              {(['days', 'months'] as const).map((option) => {
                const selected = unit === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setUnit(option)}
                    style={[styles.unitOption, selected && styles.unitOptionSelected]}>
                    <AppText
                      variant="bodyBold"
                      color={selected ? Colors.primaryDark : Colors.textMuted}>
                      {option === 'days' ? 'Days' : 'Months'}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
        {intervalText.length > 0 && !intervalIsValid ? (
          <AppText variant="caption" color={Colors.danger}>
            {kind === 'pest'
              ? 'Enter at least 1 day.'
              : unit === 'days'
                ? 'Choose between 1 and 30 days.'
                : 'Choose between 1 and 12 months.'}
          </AppText>
        ) : null}
      </View>

      <View style={styles.actions}>
        <AppButton label="Cancel" variant="ghost" onPress={onCancel} />
        <AppButton
          label={initial ? 'Save changes' : 'Start reminder'}
          onPress={() => {
            if (!canSave) return;
            onSave({ title, intervalValue, intervalUnit: unit });
          }}
          disabled={!canSave}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headingIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  headingText: {
    flex: 1,
    gap: Spacing.half,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 17,
    color: Colors.text,
    backgroundColor: Colors.backgroundSoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 2,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.two,
  },
  numberInput: {
    width: 88,
    textAlign: 'center',
  },
  unitSelector: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  unitOption: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  unitOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
