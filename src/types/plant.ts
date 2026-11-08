export type ReminderIntervalUnit = 'days' | 'months';

export type CareReminder = {
  title: string;
  intervalValue: number;
  intervalUnit: ReminderIntervalUnit;
  lastAppliedAt: number;
  nextDueAt: number;
};

export type Plant = {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  /** Timestamps (ms) of every watering, oldest first. */
  waterings: number[];
  pestReminder?: CareReminder;
  fertilizerReminder?: CareReminder;
};

export type TemperatureLevel = 1 | 2 | 3 | 4 | 5;

export type TemperatureRecord = {
  /** Local calendar date in YYYY-MM-DD format. */
  date: string;
  level: TemperatureLevel;
};

export type ViewMode = 'list' | 'grid';
