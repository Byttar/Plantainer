const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function startOfDay(time: number) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function calendarDaysBetween(from: number, to: number) {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY);
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export function formatLastWatered(time: number | null, now: number) {
  if (time === null) return 'Never watered';
  const days = calendarDaysBetween(time, now);
  if (days <= 0) return 'Watered today';
  if (days === 1) return 'Watered yesterday';
  return `Watered ${plural(days, 'day')} ago`;
}

export function formatNextWatering(time: number, now: number) {
  const days = calendarDaysBetween(now, time);
  if (time <= now) {
    const overdue = -days;
    if (overdue <= 0) return 'Water today';
    return `Overdue by ${plural(overdue, 'day')}`;
  }
  if (days <= 0) return 'Water later today';
  if (days === 1) return 'Water tomorrow';
  return `Water in ${plural(days, 'day')}`;
}

export function formatInterval(interval: number) {
  const days = interval / DAY;
  if (days < 1) return `Every ~${plural(Math.max(1, Math.round(interval / HOUR)), 'hour')}`;
  return `Every ~${plural(Math.round(days), 'day')}`;
}

export function formatDate(time: number) {
  return new Date(time).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
