import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { DeleteDataModal } from '@/components/delete-data-modal';
import { Icon } from '@/components/icon';
import { ImportDataModal } from '@/components/import-data-modal';
import { Colors, Fonts, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { usePlants } from '@/context/plants-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { exportBackup, pickBackup } from '@/lib/backup';
import type { ParsedBackup } from '@/lib/backup-format';
import {
  cancelPlantNotifications,
  requestNotificationPermission,
} from '@/lib/notifications';

type Feedback = { tone: 'success' | 'error'; message: string } | null;

export default function ConfigScreen() {
  const insets = useScreenInsets();
  const {
    plants,
    temperatureHistory,
    notificationSettings,
    setNotificationSettings,
    deleteAllData,
    replaceAllData,
  } = usePlants();
  const [exporting, setExporting] = useState(false);
  const [updatingNotifications, setUpdatingNotifications] = useState(false);
  const [notificationTime, setNotificationTime] = useState(() =>
    formatNotificationTime(notificationSettings.hour, notificationSettings.minute),
  );
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<ParsedBackup | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const totalWaterings = plants.reduce((sum, plant) => sum + plant.waterings.length, 0);
  const parsedNotificationTime = parseNotificationTime(notificationTime);

  const handleEnableOrUpdateNotifications = async () => {
    if (!parsedNotificationTime) {
      setNotificationFeedback('Enter a valid 24-hour time, such as 09:00 or 18:30.');
      return;
    }

    setUpdatingNotifications(true);
    setNotificationFeedback(null);
    try {
      if (!notificationSettings.enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          setNotificationFeedback(
            'Notification permission was not granted. You can enable it in device settings.',
          );
          return;
        }
      }
      setNotificationSettings({
        enabled: true,
        hour: parsedNotificationTime.hour,
        minute: parsedNotificationTime.minute,
      });
      setNotificationFeedback(
        `Daily plant checks are set for ${formatNotificationTime(
          parsedNotificationTime.hour,
          parsedNotificationTime.minute,
        )}.`,
      );
    } catch {
      setNotificationFeedback('Notifications could not be enabled on this device.');
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const handleDisableNotifications = async () => {
    setUpdatingNotifications(true);
    setNotificationFeedback(null);
    try {
      await cancelPlantNotifications();
      setNotificationSettings({ ...notificationSettings, enabled: false });
      setNotificationFeedback('Plant notifications are off.');
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setFeedback(null);
    try {
      await exportBackup({ version: 3, plants, temperatureHistory });
      setFeedback({ tone: 'success', message: 'Backup exported.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setFeedback({ tone: 'error', message: `Export failed: ${message}` });
    } finally {
      setExporting(false);
    }
  };

  const handlePickBackup = async () => {
    setFeedback(null);
    try {
      const backup = await pickBackup();
      if (backup) setPendingImport(backup);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setFeedback({ tone: 'error', message: `Import failed: ${message}` });
    }
  };

  const handleImport = (backup: ParsedBackup) => {
    replaceAllData({
      plants: backup.plants,
      temperatureHistory: backup.temperatureHistory,
    });
    setPendingImport(null);
    setFeedback({
      tone: 'success',
      message: `Imported ${backup.plants.length} ${backup.plants.length === 1 ? 'plant' : 'plants'}.`,
    });
  };

  const handleDelete = async () => {
    await deleteAllData();
    setFeedback({ tone: 'success', message: 'All data was deleted.' });
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.three }]}>
        <View style={styles.header}>
          <AppText variant="title">Config</AppText>
          <AppText color={Colors.textMuted}>Manage reminders and your garden’s data</AppText>
        </View>

        {Platform.OS !== 'web' ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Icon name="notification" size={20} color={Colors.primary} />
              </View>
              <View style={styles.rowText}>
                <AppText variant="bodyBold">Daily plant notifications</AppText>
                <AppText variant="caption">
                  Get a daily check-in and one digest when plants need water. Watering schedules
                  refresh whenever Plantainer opens.
                </AppText>
              </View>
            </View>

            <View style={styles.notificationControls}>
              <View style={styles.timeField}>
                <AppText variant="label" color={Colors.textMuted}>
                  DAILY TIME
                </AppText>
                <TextInput
                  accessibilityLabel="Daily notification time in 24-hour format"
                  value={notificationTime}
                  onChangeText={setNotificationTime}
                  placeholder="09:00"
                  placeholderTextColor={Colors.neutral}
                  maxLength={5}
                  style={styles.timeInput}
                />
              </View>
              <View style={styles.notificationActions}>
                <AppButton
                  label={
                    updatingNotifications
                      ? 'Updating…'
                      : notificationSettings.enabled
                        ? 'Save time'
                        : 'Enable notifications'
                  }
                  variant="secondary"
                  onPress={handleEnableOrUpdateNotifications}
                  disabled={updatingNotifications || !parsedNotificationTime}
                />
                {notificationSettings.enabled ? (
                  <AppButton
                    label="Turn off"
                    variant="ghost"
                    onPress={handleDisableNotifications}
                    disabled={updatingNotifications}
                  />
                ) : null}
              </View>
            </View>

            <AppText
              variant="caption"
              color={notificationSettings.enabled ? Colors.primaryDark : Colors.textMuted}>
              {notificationFeedback ??
                (notificationSettings.enabled
                  ? 'Notifications are enabled on this device.'
                  : 'Notifications are currently off.')}
            </AppText>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Icon name="export" size={20} color={Colors.primary} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="bodyBold">Export data</AppText>
              <AppText variant="caption">
                Save a backup file with your {plants.length}{' '}
                {plants.length === 1 ? 'plant' : 'plants'} and {totalWaterings}{' '}
                {totalWaterings === 1 ? 'watering' : 'waterings'}, plus your temperature history.
              </AppText>
            </View>
          </View>
          <AppButton
            label={exporting ? 'Exporting…' : 'Export data'}
            variant="secondary"
            onPress={handleExport}
            disabled={exporting}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handlePickBackup}
          hitSlop={8}
          style={({ pressed }) => [styles.importLink, pressed && styles.importLinkPressed]}>
          <AppText variant="caption" style={styles.importText}>
            Import data from a backup
          </AppText>
        </Pressable>

        {feedback ? (
          <AppText
            variant="caption"
            color={feedback.tone === 'success' ? Colors.primaryDark : Colors.danger}
            style={styles.feedback}>
            {feedback.message}
          </AppText>
        ) : null}

        <View style={styles.spacer} />

        <View style={styles.dangerZone}>
          <AppText variant="label" color={Colors.danger}>
            DANGER ZONE
          </AppText>
          <AppButton
            label="Delete all data"
            variant="dangerSolid"
            icon={<Icon name="trash" size={18} color={Colors.textOnPrimary} />}
            onPress={() => {
              setFeedback(null);
              setDeleteVisible(true);
            }}
          />
        </View>
      </ScrollView>

      <ImportDataModal
        backup={pendingImport}
        currentPlantCount={plants.length}
        onClose={() => setPendingImport(null)}
        onConfirm={handleImport}
      />
      <DeleteDataModal
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md + 4,
    padding: Spacing.three,
    gap: Spacing.three,
    ...Shadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  notificationControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  timeField: {
    gap: Spacing.one,
  },
  timeInput: {
    width: 104,
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    color: Colors.text,
    backgroundColor: Colors.backgroundSoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    textAlign: 'center',
  },
  notificationActions: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  importLink: {
    alignSelf: 'center',
    marginTop: -Spacing.one,
  },
  importLinkPressed: {
    opacity: 0.5,
  },
  importText: {
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
  feedback: {
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  dangerZone: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md + 4,
    borderWidth: 2,
    borderColor: Colors.dangerSoft,
  },
});

function formatNotificationTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseNotificationTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}
