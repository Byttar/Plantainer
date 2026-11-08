import { isLocalDateKey } from '@/lib/local-date';
import {
  isCareReminder,
  isTemperatureLevel,
  normalizePlant,
  type AppData,
} from '@/lib/storage';
import type { Plant, TemperatureRecord } from '@/types/plant';

export type Backup = AppData & {
  app: 'plantainer';
  exportedAt: string;
};

export function serializeBackup(data: AppData): string {
  const backup: Backup = {
    app: 'plantainer',
    ...data,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(backup, null, 2);
}

function isPlant(value: unknown): value is Plant {
  if (!value || typeof value !== 'object') return false;
  const plant = value as Record<string, unknown>;
  return (
    typeof plant.id === 'string' &&
    typeof plant.name === 'string' &&
    typeof plant.icon === 'string' &&
    typeof plant.createdAt === 'number' &&
    Array.isArray(plant.waterings) &&
    plant.waterings.every((time) => typeof time === 'number') &&
    (plant.pestReminder === undefined || isCareReminder(plant.pestReminder, 'pest')) &&
    (plant.fertilizerReminder === undefined ||
      isCareReminder(plant.fertilizerReminder, 'fertilizer'))
  );
}

function isTemperatureRecord(value: unknown): value is TemperatureRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return isLocalDateKey(record.date) && isTemperatureLevel(record.level);
}

export type ParsedBackup = {
  plants: Plant[];
  temperatureHistory: TemperatureRecord[];
  exportedAt: string | null;
};

/** Throws with a user-facing message when the text isn't a valid Plantainer backup. */
export function parseBackup(text: string): ParsedBackup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }

  const backup = data as {
    version?: unknown;
    plants?: unknown;
    temperatureHistory?: unknown;
    exportedAt?: unknown;
  } | null;
  if (!backup || typeof backup !== 'object' || !Array.isArray(backup.plants)) {
    throw new Error('This file is not a Plantainer backup.');
  }
  if (backup.version !== 1 && backup.version !== 2 && backup.version !== 3) {
    throw new Error('This backup was made by an unsupported version of the app.');
  }
  if (!backup.plants.every(isPlant)) {
    throw new Error('This backup contains invalid plant data.');
  }
  if (
    (backup.version === 2 || backup.version === 3) &&
    (!Array.isArray(backup.temperatureHistory) ||
      !backup.temperatureHistory.every(isTemperatureRecord))
  ) {
    throw new Error('This backup contains invalid temperature data.');
  }

  return {
    plants: backup.plants.map((plant) => normalizePlant(plant) as Plant),
    temperatureHistory:
      backup.version === 2 || backup.version === 3
        ? [...(backup.temperatureHistory as TemperatureRecord[])].sort((a, b) =>
            a.date.localeCompare(b.date),
          )
        : [],
    exportedAt: typeof backup.exportedAt === 'string' ? backup.exportedAt : null,
  };
}

export function backupFileName(date = new Date()) {
  return `plantainer-backup-${date.toISOString().slice(0, 10)}.json`;
}
