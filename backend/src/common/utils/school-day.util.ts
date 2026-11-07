// Nepal Standard Time is UTC+05:45 and has no daylight saving.
const NPT_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

/** Calendar day (YYYY-MM-DD) of the given moment in Nepal. */
export function schoolDateKey(date: Date | string = new Date()): string {
  return new Date(new Date(date).getTime() + NPT_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * Start (00:00 Nepal time) of the school day containing `date`, as a UTC instant.
 * Independent of the server's own time zone, so attendance lands on the right school day
 * whether the server runs in Nepal, India or UTC.
 */
export function schoolDayStart(date: Date | string = new Date()): Date {
  const [y, m, d] = schoolDateKey(date).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) - NPT_OFFSET_MS);
}

export function schoolDayEnd(date: Date | string = new Date()): Date {
  return new Date(schoolDayStart(date).getTime() + 24 * 60 * 60 * 1000);
}
