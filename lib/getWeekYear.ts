export function getWeekYear(d: Date) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    throw new Error("getWeekYear: argument must be a valid Date");
  }

  // normalize to UTC midnight for the given date (avoid timezone shifts)
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  // Shift date to Thursday in current week (ISO 8601 trick)
  // getUTCDay(): Sun=0, Mon=1, ... Sat=6. Convert Sun(0) -> 7 for ISO.
  const weekday = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + 4 - weekday);

  // Start of the ISO week-year (Jan 1 of the ISO week-year)
  const year = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const diffMs = date.getTime() - yearStart.getTime();
  if (!Number.isFinite(diffMs)) {
    throw new Error("getWeekYear: computed invalid time difference");
  }

  const dayOfYear = Math.floor(diffMs / MS_PER_DAY) + 1; // Jan 1 -> day 1
  const week = Math.ceil(dayOfYear / 7);

  return { week, year };
}