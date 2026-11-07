import NepaliDate from 'nepali-date-converter';

/**
 * Date helpers for Nepal: day-first Gregorian (AD) dates with the Bikram Sambat (BS) date beside them.
 * Everything is defensive: a missing or invalid value shows "—" instead of throwing.
 */
const valid = (v: any): Date | null => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

/** 06 Nov 2026 */
export const formatDateAD = (v: any): string => {
  const d = valid(v);
  return d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
};

/** 20 Kartik 2083 (BS). Returns "" when the date is outside the converter's supported range. */
export const formatDateBS = (v: any): string => {
  const d = valid(v);
  if (!d) return '';
  try {
    return new NepaliDate(d).format('DD MMMM YYYY');
  } catch {
    return '';
  }
};

/** 10:42 pm */
export const formatTime = (v: any): string => {
  const d = valid(v);
  return d ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
};

/** 06 Nov 2026 (20 Kartik 2083) */
export const formatDate = (v: any): string => {
  const ad = formatDateAD(v);
  const bs = formatDateBS(v);
  return bs ? `${ad} (${bs} BS)` : ad;
};

/** 06 Nov 2026 (20 Kartik 2083 BS), 10:42 pm */
export const formatDateTime = (v: any): string => {
  const d = valid(v);
  return d ? `${formatDate(d)}, ${formatTime(d)}` : '—';
};

/** NPR amounts with Nepali (lakh/crore) digit grouping: 12,34,567 */
export const formatNpr = (n: any): string => `NPR ${Number(n || 0).toLocaleString('en-IN')}`;
