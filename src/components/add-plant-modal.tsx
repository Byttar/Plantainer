import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { BottomSheet } from '@/components/bottom-sheet';
import { Icon } from '@/components/icon';
import { PlantIcon } from '@/components/plant-icon';
import {
  DefaultPlantIcon,
  EmojiPlantIcons,
  SvgPlantIconLabels,
  SvgPlantIcons,
} from '@/constants/plant-icons';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { usePlants } from '@/context/plants-context';

const SUCCESS_DURATION = 1400;

type IconSectionProps<T extends string> = {
  title: string;
  options: readonly T[];
  selected: string;
  onSelect: (icon: T) => void;
  getLabel?: (icon: T) => string;
};

function IconSection<T extends string>({
  title,
  options,
  selected,
  onSelect,
  getLabel,
}: IconSectionProps<T>) {
  return (
    <View style={styles.field}>
      <AppText variant="label" color={Colors.textMuted}>
        {title}
      </AppText>
      <View style={styles.iconGrid}>
        {options.map((option) => {
          const isSelected = option === selected;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={getLabel?.(option) ?? option}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option)}
              style={[styles.iconOption, isSelected && styles.iconOptionSelected]}>
              <PlantIcon icon={option} size={26} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type AddPlantModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddPlantModal({ visible, onClose }: AddPlantModalProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {visible ? <AddPlantForm onDone={onClose} /> : null}
    </BottomSheet>
  );
}

function AddPlantForm({ onDone }: { onDone: () => void }) {
  const { addPlant } = usePlants();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(DefaultPlantIcon);
  const [addedName, setAddedName] = useState<string | null>(null);

  useEffect(() => {
    if (addedName === null) return;
    const timer = setTimeout(onDone, SUCCESS_DURATION);
    return () => clearTimeout(timer);
  }, [addedName, onDone]);

  const canSubmit = name.trim().length > 0;

  const submit = () => {
    if (!canSubmit || addedName !== null) return;
    const plant = addPlant({ name, icon });
    setAddedName(plant.name);
  };

  return (
    <>
      {addedName !== null ? (
        <View style={styles.success}>
          <Animated.View entering={ZoomIn.springify()} style={styles.successIcon}>
            <Icon name="check" size={40} color={Colors.primary} />
          </Animated.View>
          <AppText variant="heading">Plant added with success!</AppText>
          <View style={styles.successMessage}>
            <PlantIcon icon={icon} size={20} />
            <AppText color={Colors.textMuted}>{addedName} is now part of your garden.</AppText>
          </View>
        </View>
      ) : (
        <>
          <AppText variant="heading">New plant</AppText>

          <View style={styles.field}>
            <AppText variant="label" color={Colors.textMuted}>
              PLANT NAME
            </AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Kitchen basil"
              placeholderTextColor={Colors.neutral}
              style={styles.input}
              autoFocus
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
          </View>

          <IconSection
            title="ILLUSTRATIONS"
            options={SvgPlantIcons}
            selected={icon}
            onSelect={setIcon}
            getLabel={(option) => SvgPlantIconLabels[option]}
          />
          <IconSection title="EMOJI" options={EmojiPlantIcons} selected={icon} onSelect={setIcon} />

          <AppButton label="Add plant" onPress={submit} disabled={!canSubmit} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSoft,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  success: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
});
