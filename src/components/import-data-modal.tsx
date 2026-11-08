import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { BottomSheet } from '@/components/bottom-sheet';
import { Icon } from '@/components/icon';
import { Colors } from '@/constants/theme';
import type { ParsedBackup } from '@/lib/backup-format';
import { formatDate } from '@/lib/format';

type ImportDataModalProps = {
  backup: ParsedBackup | null;
  currentPlantCount: number;
  onClose: () => void;
  onConfirm: (backup: ParsedBackup) => void;
};

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export function ImportDataModal({
  backup,
  currentPlantCount,
  onClose,
  onConfirm,
}: ImportDataModalProps) {
  const waterings = backup?.plants.reduce((sum, plant) => sum + plant.waterings.length, 0) ?? 0;
  const exportedAt = backup?.exportedAt ? Date.parse(backup.exportedAt) : NaN;

  return (
    <BottomSheet visible={backup !== null} onClose={onClose}>
      {backup ? (
        <>
          <View style={styles.iconCircle}>
            <Icon name="import" size={28} color={Colors.primary} />
          </View>
          <AppText variant="heading" style={styles.centered}>
            Import this backup?
          </AppText>
          <AppText color={Colors.textMuted} style={styles.centered}>
            It has {plural(backup.plants.length, 'plant')}, {plural(waterings, 'watering')}, and{' '}
            {plural(backup.temperatureHistory.length, 'temperature check-in')}
            {Number.isNaN(exportedAt) ? '' : `, exported on ${formatDate(exportedAt)}`}.
          </AppText>
          {currentPlantCount > 0 ? (
            <AppText variant="caption" color={Colors.danger} style={styles.centered}>
              Your current {plural(currentPlantCount, 'plant')} will be replaced.
            </AppText>
          ) : null}
          <AppButton label="Import data" onPress={() => onConfirm(backup)} />
          <AppButton label="Cancel" variant="ghost" onPress={onClose} />
        </>
      ) : null}
    </BottomSheet>
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
});
