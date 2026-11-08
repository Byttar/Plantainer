import type { CareReminder, ReminderIntervalUnit } from '@/types/plant';

const DAY_MS = 24 * 60 * 60 * 1000;

function localDayNumber(time: number) {
  const date = new Date(time);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function calculateNextDueAt(
  appliedAt: number,
  intervalValue: number,
  intervalUnit: ReminderIntervalUnit,
) {
  const due = new Date(appliedAt);

  if (intervalUnit === 'days') {
    due.setDate(due.getDate() + intervalValue);
    return startOfLocalDay(due);
  }

  const originalDay = due.getDate();
  due.setDate(1);
  due.setMonth(due.getMonth() + intervalValue);
  const lastDayOfTargetMonth = new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate();
  due.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  return startOfLocalDay(due);
}

export function createCareReminder(
  input: {
    title: string;
    intervalValue: number;
    intervalUnit: ReminderIntervalUnit;
  },
  existing?: CareReminder,
  now = Date.now(),
): CareReminder {
  const lastAppliedAt = existing?.lastAppliedAt ?? now;
  return {
    title: input.title.trim(),
    intervalValue: input.intervalValue,
    intervalUnit: input.intervalUnit,
    lastAppliedAt,
    nextDueAt: calculateNextDueAt(lastAppliedAt, input.intervalValue, input.intervalUnit),
  };
}

export function reapplyCareReminder(reminder: CareReminder, now = Date.now()): CareReminder {
  return {
    ...reminder,
    lastAppliedAt: now,
    nextDueAt: calculateNextDueAt(now, reminder.intervalValue, reminder.intervalUnit),
  };
}

export function reminderDaysRemaining(reminder: CareReminder, now: number) {
  return localDayNumber(reminder.nextDueAt) - localDayNumber(now);
}

export function isReminderCurrent(reminder: CareReminder, now: number) {
  return reminderDaysRemaining(reminder, now) > 0;
}

export function formatPestReminder(reminder: CareReminder, now: number) {
  const days = reminderDaysRemaining(reminder, now);
  if (days > 1) {
    return `${days} days remaining until ${reminder.title} needs to be applied again`;
  }
  if (days === 1) {
    return `1 day remaining until ${reminder.title} needs to be applied again`;
  }
  if (days === 0) return `${reminder.title} needs to be applied today`;
  const overdueDays = Math.abs(days);
  return `${reminder.title} is overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`;
}

export function formatFertilizerReminder(reminder: CareReminder, now: number) {
  const days = reminderDaysRemaining(reminder, now);
  if (days > 1) return `Fertilize with ${reminder.title} in ${days} days`;
  if (days === 1) return `Fertilize with ${reminder.title} tomorrow`;
  if (days === 0) return `Fertilize with ${reminder.title} today`;
  const overdueDays = Math.abs(days);
  return `Fertilizing with ${reminder.title} is overdue by ${overdueDays} ${
    overdueDays === 1 ? 'day' : 'days'
  }`;
}
