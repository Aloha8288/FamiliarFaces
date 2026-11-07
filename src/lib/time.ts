import type { DayAvailability, TimeWindow, WeeklyAvailability } from './types';

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const fromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const formatClock = (hhmm: string) => {
  const mins = toMinutes(hhmm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hh} ${suffix}` : `${hh}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const formatWindow = (w: TimeWindow) => `${formatClock(w.start)} – ${formatClock(w.end)}`;

/** Monday = 0 … Sunday = 6 */
export const mondayIndex = (d: Date) => (d.getDay() + 6) % 7;

export const startOfWeek = (d = new Date()) => {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - mondayIndex(s));
  return s;
};

export const isSameWeek = (iso: string, ref = new Date()) => {
  const start = startOfWeek(ref).getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  const t = new Date(iso).getTime();
  return t >= start && t < end;
};

/** Calculates age from a full YYYY-MM-DD birth date, accounting for month and day. */
export function calculateAge(dob: string, today = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const [y, m, d] = dob.split('-').map(Number);
  const birth = new Date(y, m - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return null;
  if (birth > today) return null;
  let age = today.getFullYear() - y;
  const hadBirthday = today.getMonth() > m - 1 || (today.getMonth() === m - 1 && today.getDate() >= d);
  if (!hadBirthday) age -= 1;
  return age;
}

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = {}) =>
  new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', ...opts });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export const fmtHours = (minutes: number) => {
  const h = minutes / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} ${h === 1 ? 'hr' : 'hrs'}`;
};

export const fmtDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
};

export const dayPart = (hhmm: string) => {
  const m = toMinutes(hhmm);
  if (m < 12 * 60) return 'morning';
  if (m < 17 * 60) return 'afternoon';
  return 'evening';
};

export const emptyWeek = (): WeeklyAvailability =>
  Array.from({ length: 7 }, () => ({ available: false, windows: [] }));

export const week = (spec: Partial<Record<number, TimeWindow[]>>): WeeklyAvailability =>
  Array.from({ length: 7 }, (_, i): DayAvailability => {
    const w = spec[i];
    return w && w.length ? { available: true, windows: w } : { available: false, windows: [] };
  });

/** Overlapping minutes between two lists of windows. */
export function overlapWindows(a: TimeWindow[], b: TimeWindow[]): TimeWindow[] {
  const out: TimeWindow[] = [];
  for (const x of a) {
    for (const y of b) {
      const s = Math.max(toMinutes(x.start), toMinutes(y.start));
      const e = Math.min(toMinutes(x.end), toMinutes(y.end));
      if (e - s > 0) out.push({ start: fromMinutes(s), end: fromMinutes(e) });
    }
  }
  return out;
}

export const windowMinutes = (w: TimeWindow) => toMinutes(w.end) - toMinutes(w.start);

export const toLocalDateInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const combineDateTime = (date: string, hhmm: string) => {
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  return new Date(y, m - 1, d, h, mi, 0, 0);
};
