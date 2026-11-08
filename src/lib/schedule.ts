import { toLocalDateKey } from '@/lib/local-date';
import type { Plant, TemperatureLevel, TemperatureRecord } from '@/types/plant';

export const MIN_WATERINGS = 3;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Only the most recent intervals are used so the schedule adapts to seasons. */
const MAX_INTERVALS = 6;
/** Waterings closer than this are treated as noise when estimating the interval. */
const MIN_INTERVAL = 6 * HOUR;

export type PlantStatus = 'learning' | 'ok' | 'needsWater' | 'atRisk';

export type PlantSchedule = {
  status: PlantStatus;
  lastWatered: number | null;
  /** Estimated time between waterings, or null while learning. */
  interval: number | null;
  /** Temperature-adjusted next watering time. */
  nextWatering: number | null;
  /** Next watering time without temperature adjustments. */
  normalNextWatering: number | null;
  /** Positive values mean the plant has reached its adjusted watering time. */
  wateringScore: number | null;
  shouldWaterEarly: boolean;
  temperatureAdjustment: number;
  temperatureRecordsUsed: number;
  /** How many more waterings are needed before a schedule can be estimated. */
  wateringsMissing: number;
};

const TEMPERATURE_MULTIPLIERS: Record<TemperatureLevel, number> = {
  1: 0.75,
  2: 0.875,
  3: 1,
  4: 1.125,
  5: 1.25,
};

/**
 * Weighted average of the most recent intervals between waterings,
 * giving more weight to recent ones.
 */
export function estimateInterval(waterings: number[]): number | null {
  const intervals: number[] = [];
  for (let i = 1; i < waterings.length; i++) {
    const gap = waterings[i] - waterings[i - 1];
    if (gap >= MIN_INTERVAL) intervals.push(gap);
  }
  const recent = intervals.slice(-MAX_INTERVALS);
  if (recent.length === 0) return null;

  let weighted = 0;
  let totalWeight = 0;
  recent.forEach((gap, index) => {
    const weight = index + 1;
    weighted += gap * weight;
    totalWeight += weight;
  });
  return weighted / totalWeight;
}

export function getSchedule(
  plant: Plant,
  now: number,
  temperatureHistory: TemperatureRecord[] = [],
): PlantSchedule {
  const lastWatered = plant.waterings.at(-1) ?? null;
  const wateringsMissing = Math.max(0, MIN_WATERINGS - plant.waterings.length);
  const interval = wateringsMissing === 0 ? estimateInterval(plant.waterings) : null;

  if (lastWatered === null || interval === null) {
    return {
      status: 'learning',
      lastWatered,
      interval: null,
      nextWatering: null,
      normalNextWatering: null,
      wateringScore: null,
      shouldWaterEarly: false,
      temperatureAdjustment: 0,
      temperatureRecordsUsed: 0,
      wateringsMissing: Math.max(1, wateringsMissing),
    };
  }

  const firstDate = toLocalDateKey(lastWatered);
  const today = toLocalDateKey(now);
  const relevantTemperatures = temperatureHistory.filter(
    (record) => record.date >= firstDate && record.date <= today,
  );
  const temperatureAdjustment = relevantTemperatures.reduce(
    (total, record) => total + (TEMPERATURE_MULTIPLIERS[record.level] - 1) * DAY,
    0,
  );
  const normalNextWatering = lastWatered + interval;
  const nextWatering = normalNextWatering - temperatureAdjustment;
  const elapsed = now - lastWatered;
  const effectiveElapsed = elapsed + temperatureAdjustment;
  const wateringScore = effectiveElapsed / interval - 1;
  const normalOverdueBy = now - normalNextWatering;
  const riskThreshold = Math.max(DAY, interval * 0.5);
  const shouldWaterEarly = wateringScore >= 0 && normalOverdueBy < 0;

  let status: PlantStatus = 'ok';
  if (normalOverdueBy >= riskThreshold) status = 'atRisk';
  else if (wateringScore >= 0) status = 'needsWater';

  return {
    status,
    lastWatered,
    interval,
    nextWatering,
    normalNextWatering,
    wateringScore,
    shouldWaterEarly,
    temperatureAdjustment,
    temperatureRecordsUsed: relevantTemperatures.length,
    wateringsMissing: 0,
  };
}

const STATUS_PRIORITY: Record<PlantStatus, number> = {
  atRisk: 0,
  needsWater: 1,
  ok: 2,
  learning: 3,
};

export type ScheduledPlant = { plant: Plant; schedule: PlantSchedule };

/** Most urgent first: at risk, needs water, then by next watering date, then learning. */
export function sortByUrgency(
  plants: Plant[],
  now: number,
  temperatureHistory: TemperatureRecord[] = [],
): ScheduledPlant[] {
  return plants
    .map((plant) => ({ plant, schedule: getSchedule(plant, now, temperatureHistory) }))
    .sort((a, b) => {
      const byStatus = STATUS_PRIORITY[a.schedule.status] - STATUS_PRIORITY[b.schedule.status];
      if (byStatus !== 0) return byStatus;
      if (a.schedule.nextWatering !== null && b.schedule.nextWatering !== null) {
        return a.schedule.nextWatering - b.schedule.nextWatering;
      }
      return a.plant.name.localeCompare(b.plant.name);
    });
}
