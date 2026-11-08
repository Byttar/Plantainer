import { getSchedule, type PlantSchedule, type PlantStatus } from '@/lib/schedule';
import { toLocalDateKey } from '@/lib/local-date';
import type { Plant, TemperatureLevel, TemperatureRecord } from '@/types/plant';

const DAY = 24 * 60 * 60 * 1000;
const WEEK_DAYS = 7;

export type DayStat = { key: number; label: string; count: number; isToday: boolean };

export type TemperatureDayStat = {
  date: string;
  label: string;
  level: TemperatureLevel | null;
  isToday: boolean;
};

export type PlantStat = {
  plant: Plant;
  schedule: PlantSchedule;
  total: number;
  thisWeek: number;
};

export type GardenStats = {
  totalPlants: number;
  totalWaterings: number;
  wateringsThisWeek: number;
  statusCounts: Record<PlantStatus, number>;
  week: DayStat[];
  temperatureWeek: TemperatureDayStat[];
  plants: PlantStat[];
  thirstiest: PlantStat | null;
  mostWatered: PlantStat | null;
};

function startOfDay(time: number) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function getGardenStats(
  plants: Plant[],
  now: number,
  temperatureHistory: TemperatureRecord[] = [],
): GardenStats {
  const today = startOfDay(now);
  const weekStart = today - (WEEK_DAYS - 1) * DAY;

  const week: DayStat[] = Array.from({ length: WEEK_DAYS }, (_, index) => {
    const day = weekStart + index * DAY;
    return {
      key: day,
      label: new Date(day).toLocaleDateString(undefined, { weekday: 'short' }),
      count: 0,
      isToday: day === today,
    };
  });

  const temperaturesByDate = new Map(
    temperatureHistory.map((record) => [record.date, record.level]),
  );
  const temperatureWeek: TemperatureDayStat[] = Array.from(
    { length: WEEK_DAYS },
    (_, index) => {
      const date = new Date(now);
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - (WEEK_DAYS - 1 - index));
      const dateKey = toLocalDateKey(date);
      return {
        date: dateKey,
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        level: temperaturesByDate.get(dateKey) ?? null,
        isToday: index === WEEK_DAYS - 1,
      };
    },
  );

  const statusCounts: Record<PlantStatus, number> = { atRisk: 0, needsWater: 0, ok: 0, learning: 0 };
  let totalWaterings = 0;
  let wateringsThisWeek = 0;

  const plantStats = plants.map((plant): PlantStat => {
    const schedule = getSchedule(plant, now, temperatureHistory);
    statusCounts[schedule.status]++;
    totalWaterings += plant.waterings.length;

    let thisWeek = 0;
    for (const time of plant.waterings) {
      if (time < weekStart) continue;
      const index = Math.round((startOfDay(time) - weekStart) / DAY);
      if (index >= 0 && index < WEEK_DAYS) {
        week[index].count++;
        thisWeek++;
      }
    }
    wateringsThisWeek += thisWeek;

    return { plant, schedule, total: plant.waterings.length, thisWeek };
  });

  let thirstiest: PlantStat | null = null;
  let mostWatered: PlantStat | null = null;
  for (const stat of plantStats) {
    const interval = stat.schedule.interval;
    if (interval !== null && (thirstiest === null || interval < (thirstiest.schedule.interval ?? Infinity))) {
      thirstiest = stat;
    }
    if (stat.total > 0 && (mostWatered === null || stat.total > mostWatered.total)) {
      mostWatered = stat;
    }
  }

  return {
    totalPlants: plants.length,
    totalWaterings,
    wateringsThisWeek,
    statusCounts,
    week,
    temperatureWeek,
    plants: plantStats.sort((a, b) => b.total - a.total),
    thirstiest,
    mostWatered,
  };
}
