import AsyncStorage from '@react-native-async-storage/async-storage';

import { calculateNextDueAt } from '@/lib/care-reminders';
import { isLocalDateKey } from '@/lib/local-date';
import type {
  CareReminder,
  Plant,
  TemperatureLevel,
  TemperatureRecord,
  ViewMode,
} from '@/types/plant';

const DATA_KEY = 'plantainer:data';
const VIEW_MODE_KEY = 'plantainer:view-mode';
const NOTIFICATION_SETTINGS_KEY = 'plantainer:notification-settings';

export type NotificationSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export const DefaultNotificationSettings: NotificationSettings = {
  enabled: false,
  hour: 9,
  minute: 0,
};

/** Everything that should end up in a backup. Bump `version` on breaking shape changes. */
export type AppData = {
  version: 3;
  plants: Plant[];
  temperatureHistory: TemperatureRecord[];
};

const emptyData: AppData = { version: 3, plants: [], temperatureHistory: [] };

export function isCareReminder(
  value: unknown,
  kind: 'pest' | 'fertilizer',
): value is CareReminder {
  if (!value || typeof value !== 'object') return false;
  const reminder = value as Record<string, unknown>;
  if (
    typeof reminder.title !== 'string' ||
    reminder.title.trim().length === 0 ||
    !Number.isInteger(reminder.intervalValue) ||
    typeof reminder.intervalValue !== 'number' ||
    reminder.intervalValue < 1 ||
    (reminder.intervalUnit !== 'days' && reminder.intervalUnit !== 'months') ||
    typeof reminder.lastAppliedAt !== 'number' ||
    !Number.isFinite(reminder.lastAppliedAt) ||
    typeof reminder.nextDueAt !== 'number' ||
    !Number.isFinite(reminder.nextDueAt)
  ) {
    return false;
  }
  if (kind === 'pest') return reminder.intervalUnit === 'days';
  return reminder.intervalUnit === 'days'
    ? reminder.intervalValue <= 30
    : reminder.intervalValue <= 12;
}

export function normalizePlant(value: unknown): Plant | null {
  if (!value || typeof value !== 'object') return null;
  const plant = value as Record<string, unknown>;
  if (
    typeof plant.id !== 'string' ||
    typeof plant.name !== 'string' ||
    typeof plant.icon !== 'string' ||
    typeof plant.createdAt !== 'number' ||
    !Array.isArray(plant.waterings) ||
    !plant.waterings.every((time) => typeof time === 'number' && Number.isFinite(time))
  ) {
    return null;
  }

  const pestReminder = isCareReminder(plant.pestReminder, 'pest')
    ? normalizeReminder(plant.pestReminder)
    : undefined;
  const fertilizerReminder = isCareReminder(plant.fertilizerReminder, 'fertilizer')
    ? normalizeReminder(plant.fertilizerReminder)
    : undefined;

  return {
    id: plant.id,
    name: plant.name,
    icon: plant.icon,
    createdAt: plant.createdAt,
    waterings: [...plant.waterings].sort((a, b) => a - b),
    ...(pestReminder ? { pestReminder } : {}),
    ...(fertilizerReminder ? { fertilizerReminder } : {}),
  };
}

function normalizeReminder(reminder: CareReminder): CareReminder {
  return {
    ...reminder,
    title: reminder.title.trim(),
    nextDueAt: calculateNextDueAt(
      reminder.lastAppliedAt,
      reminder.intervalValue,
      reminder.intervalUnit,
    ),
  };
}

export function isTemperatureLevel(value: unknown): value is TemperatureLevel {
  return Number.isInteger(value) && typeof value === 'number' && value >= 1 && value <= 5;
}

export function normalizeTemperatureHistory(value: unknown): TemperatureRecord[] {
  if (!Array.isArray(value)) return [];

  const byDate = new Map<string, TemperatureLevel>();
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    if (isLocalDateKey(record.date) && isTemperatureLevel(record.level)) {
      byDate.set(record.date, record.level);
    }
  }

  return [...byDate]
    .map(([date, level]) => ({ date, level }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(DATA_KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      version: 3,
      plants: Array.isArray(parsed.plants)
        ? parsed.plants.map(normalizePlant).filter((plant): plant is Plant => plant !== null)
        : [],
      temperatureHistory: normalizeTemperatureHistory(parsed.temperatureHistory),
    };
  } catch (error) {
    console.warn('Failed to load plant data', error);
    return emptyData;
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save plant data', error);
  }
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([DATA_KEY, VIEW_MODE_KEY, NOTIFICATION_SETTINGS_KEY]);
}

export async function loadViewMode(): Promise<ViewMode> {
  const value = await AsyncStorage.getItem(VIEW_MODE_KEY).catch(() => null);
  return value === 'grid' ? 'grid' : 'list';
}

export async function saveViewMode(mode: ViewMode): Promise<void> {
  await AsyncStorage.setItem(VIEW_MODE_KEY, mode).catch(() => {});
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!raw) return DefaultNotificationSettings;
    const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
    if (
      typeof parsed.enabled !== 'boolean' ||
      !Number.isInteger(parsed.hour) ||
      typeof parsed.hour !== 'number' ||
      parsed.hour < 0 ||
      parsed.hour > 23 ||
      !Number.isInteger(parsed.minute) ||
      typeof parsed.minute !== 'number' ||
      parsed.minute < 0 ||
      parsed.minute > 59
    ) {
      return DefaultNotificationSettings;
    }
    return { enabled: parsed.enabled, hour: parsed.hour, minute: parsed.minute };
  } catch {
    return DefaultNotificationSettings;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
}
