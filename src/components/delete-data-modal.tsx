import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { BottomSheet } from '@/components/bottom-sheet';
import { Icon } from '@/components/icon';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

export const DELETE_CONFIRMATION = 'I am aware';

type DeleteDataModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteDataModal({ visible, onClose, onConfirm }: DeleteDataModalProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {visible ? <DeleteDataForm onClose={onClose} onConfirm={onConfirm} /> : null}
    </BottomSheet>
  );
}

function DeleteDataForm({ onClose, onConfirm }: Omit<DeleteDataModalProps, 'visible'>) {
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const confirmed = text.trim() === DELETE_CONFIRMATION;

  const confirm = async () => {
    if (!confirmed || deleting) return;
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <View style={styles.iconCircle}>
        <Icon name="danger" size={28} color={Colors.danger} />
      </View>
      <AppText variant="heading" style={styles.centered}>
        Delete all data?
      </AppText>
      <AppText color={Colors.textMuted} style={styles.centered}>
        This permanently removes every plant and its watering history from this device. It can’t be
        undone, so consider exporting a backup first.
      </AppText>

      <View style={styles.field}>
        <AppText variant="caption">
          Type <AppText variant="bodyBold">{DELETE_CONFIRMATION}</AppText> to confirm
        </AppText>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={DELETE_CONFIRMATION}
          placeholderTextColor={Colors.neutral}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, confirmed && styles.inputConfirmed]}
          returnKeyType="done"
          onSubmitEditing={confirm}
        />
      </View>

      <AppButton
        label={deleting ? 'Deleting…' : 'Delete all data'}
        variant="dangerSolid"
        icon={<Icon name="trash" size={18} color={Colors.textOnPrimary} />}
        onPress={confirm}
        disabled={!confirmed || deleting}
      />
      <AppButton label="Cancel" variant="ghost" onPress={onClose} />
    </>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
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
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 2,
  },
  inputConfirmed: {
    borderColor: Colors.danger,
  },
});
