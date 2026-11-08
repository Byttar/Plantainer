import { createCareReminder } from '@/lib/care-reminders';
import { toLocalDateKey } from '@/lib/local-date';
import type { Plant, TemperatureRecord } from '@/types/plant';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** One watering per day, starting `firstDaysAgo` days ago and going back `count` days. */
function dailyWaterings(now: number, firstDaysAgo: number, count: number) {
  return Array.from({ length: count }, (_, index) => now - (firstDaysAgo + index) * DAY - HOUR).reverse();
}

function intervalWaterings(lastWatered: number, interval: number, count: number) {
  return Array.from(
    { length: count },
    (_, index) => lastWatered - (count - 1 - index) * interval,
  );
}

function createDevPlants(now: number): Plant[] {
  return [
    {
      id: 'dev-watered-yesterday',
      name: 'Basil (dev)',
      icon: '🌿',
      createdAt: now - 8 * DAY,
      // Watered every day this week, not yet today.
      waterings: dailyWaterings(now, 1, 7),
      fertilizerReminder: createCareReminder(
        { title: 'Liquid seaweed', intervalValue: 30, intervalUnit: 'days' },
        undefined,
        now - 5 * DAY,
      ),
    },
    {
      id: 'dev-watered-two-days-ago',
      name: 'Fern (dev)',
      icon: '🍃',
      createdAt: now - 9 * DAY,
      // Watered every day this week, but not for the last two days.
      waterings: dailyWaterings(now, 2, 7),
      fertilizerReminder: createCareReminder(
        { title: 'Balanced fertilizer', intervalValue: 30, intervalUnit: 'days' },
        undefined,
        now - 31 * DAY,
      ),
    },
    {
      id: 'dev-weather-early',
      name: 'Calathea (hot week)',
      icon: '🪴',
      createdAt: now - 14 * DAY,
      // Its learned rhythm is every three days. It was watered 2.5 days ago, so
      // the really-hot weather seed should move its recommendation into today.
      waterings: intervalWaterings(now - 60 * HOUR, 3 * DAY, 4),
      pestReminder: createCareReminder(
        { title: 'Neem oil', intervalValue: 7, intervalUnit: 'days' },
        undefined,
        now - 8 * DAY,
      ),
    },
  ];
}

/** Adds the demo plants in development builds unless they are already stored. */
export function withDevPlants(plants: Plant[], now: number): Plant[] {
  if (!__DEV__) return plants;
  const devPlants = createDevPlants(now);
  const devIds = new Set(devPlants.map((plant) => plant.id));
  return [...plants.filter((plant) => !devIds.has(plant.id)), ...devPlants];
}

/** Seeds the last seven local calendar days as really hot in development builds. */
export function withDevTemperatureHistory(
  history: TemperatureRecord[],
  now: number,
): TemperatureRecord[] {
  if (!__DEV__) return history;

  const hotWeek = Array.from({ length: 7 }, (_, daysAgo): TemperatureRecord => {
    const date = new Date(now);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);
    return { date: toLocalDateKey(date), level: 5 };
  });
  const hotDates = new Set(hotWeek.map((record) => record.date));

  return [...history.filter((record) => !hotDates.has(record.date)), ...hotWeek].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
