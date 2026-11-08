import AsyncStorage from '@react-native-async-storage/async-storage';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getSchedule } from '@/lib/schedule';
import type { NotificationSettings } from '@/lib/storage';
import type { Plant, TemperatureRecord } from '@/types/plant';

const CHANNEL_ID = 'watering-reminders';
const SCHEDULED_IDS_KEY = 'plantainer:scheduled-notification-ids';
const MAX_WATERING_DIGESTS = 60;

let schedulingQueue = Promise.resolve();

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function notificationsAllowed(status: Notifications.NotificationPermissionsStatus) {
  return (
    status.granted ||
    status.ios?.status === IosAuthorizationStatus.PROVISIONAL
  );
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Plant care reminders',
    description: 'Daily plant checks and watering reminders',
    importance: AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 150, 200],
    lightColor: '#38854D',
  });
}

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (notificationsAllowed(current)) return true;
  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });
  return notificationsAllowed(requested);
}

async function readScheduledIds() {
  try {
    const raw = await AsyncStorage.getItem(SCHEDULED_IDS_KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

async function cancelPlantNotificationsInternal() {
  const ids = await readScheduledIds();
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})),
  );
  await AsyncStorage.removeItem(SCHEDULED_IDS_KEY).catch(() => {});
}

export function cancelPlantNotifications() {
  const work = schedulingQueue.then(async () => {
    if (Platform.OS === 'web') return;
    await cancelPlantNotificationsInternal();
  });
  schedulingQueue = work.catch(() => {});
  return work;
}

function nextCheckTime(dueAt: number, settings: NotificationSettings, now: number) {
  const trigger = new Date(dueAt);
  trigger.setHours(settings.hour, settings.minute, 0, 0);
  if (trigger.getTime() > now) return trigger;

  const next = new Date(now);
  next.setHours(settings.hour, settings.minute, 0, 0);
  if (next.getTime() <= now) next.setDate(next.getDate() + 1);
  return next;
}

function wateringDigestBody(names: string[]) {
  if (names.length === 1) return `${names[0]} needs watering.`;
  if (names.length === 2) return `${names[0]} and ${names[1]} need watering.`;
  return `${names[0]}, ${names[1]}, and ${names.length - 2} more need watering.`;
}

async function reconcilePlantNotificationsInternal(
  plants: Plant[],
  temperatureHistory: TemperatureRecord[],
  settings: NotificationSettings,
) {
  if (Platform.OS === 'web') return;
  await cancelPlantNotificationsInternal();
  if (!settings.enabled) return;

  const permission = await Notifications.getPermissionsAsync();
  if (!notificationsAllowed(permission)) return;
  await ensureAndroidChannel();

  const scheduledIds: string[] = [];
  try {
    scheduledIds.push(
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Plantainer',
          body: 'Time to check your plants.',
          data: { kind: 'daily-check' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: settings.hour,
          minute: settings.minute,
          channelId: CHANNEL_ID,
        },
      }),
    );

    const now = Date.now();
    const groups = new Map<number, string[]>();
    for (const plant of plants) {
      const schedule = getSchedule(plant, now, temperatureHistory);
      if (schedule.nextWatering === null) continue;
      const trigger = nextCheckTime(schedule.nextWatering, settings, now).getTime();
      const names = groups.get(trigger) ?? [];
      names.push(plant.name);
      groups.set(trigger, names);
    }

    const upcomingGroups = [...groups.entries()]
      .sort(([first], [second]) => first - second)
      .slice(0, MAX_WATERING_DIGESTS);

    for (const [triggerTime, names] of upcomingGroups) {
      scheduledIds.push(
        await Notifications.scheduleNotificationAsync({
          content: {
            title: names.length === 1 ? 'Watering reminder' : `${names.length} plants need water`,
            body: wateringDigestBody(names),
            data: { kind: 'watering-digest' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerTime,
            channelId: CHANNEL_ID,
          },
        }),
      );
    }
  } finally {
    await AsyncStorage.setItem(SCHEDULED_IDS_KEY, JSON.stringify(scheduledIds)).catch(() => {});
  }
}

export function reconcilePlantNotifications(
  plants: Plant[],
  temperatureHistory: TemperatureRecord[],
  settings: NotificationSettings,
) {
  const work = schedulingQueue.then(() =>
    reconcilePlantNotificationsInternal(plants, temperatureHistory, settings),
  );
  schedulingQueue = work.catch((error) => {
    console.warn('Failed to schedule plant notifications', error);
  });
  return work;
}
