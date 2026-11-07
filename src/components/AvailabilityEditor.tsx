import { Plus, Trash2 } from 'lucide-react';
import type { WeeklyAvailability, TimeWindow } from '../lib/types';
import { DAY_NAMES, DAY_PRESETS } from '../lib/options';
import { toMinutes } from '../lib/time';
import { Button, cx } from './ui';

type PresetName = keyof typeof DAY_PRESETS;

/** Weekly schedule editor: per-day toggle, quick presets, and custom start/end windows. */
export function AvailabilityEditor({ value, onChange }: { value: WeeklyAvailability; onChange: (v: WeeklyAvailability) => void }) {
  const setDay = (i: number, fn: (d: WeeklyAvailability[number]) => WeeklyAvailability[number]) =>
    onChange(value.map((d, j) => (j === i ? fn(d) : d)));

  const hasPreset = (windows: TimeWindow[], p: PresetName) =>
    windows.some((w) => w.start === DAY_PRESETS[p].start && w.end === DAY_PRESETS[p].end);

  const togglePreset = (i: number, p: PresetName) =>
    setDay(i, (d) => {
      const preset = DAY_PRESETS[p];
      const windows = hasPreset(d.windows, p)
        ? d.windows.filter((w) => !(w.start === preset.start && w.end === preset.end))
        : [...d.windows, { ...preset }].sort((a, b) => a.start.localeCompare(b.start));
      return { available: windows.length > 0 || d.available, windows };
    });

  return (
    <div className="space-y-2.5">
      {value.map((day, i) => (
        <div key={DAY_NAMES[i]} className={cx('rounded-2xl border p-4 transition', day.available ? 'border-sage-200 bg-paper' : 'border-line/70 bg-cream/60')}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex w-36 items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={day.available}
                aria-label={`${DAY_NAMES[i]} availability`}
                onClick={() => setDay(i, (d) => (d.available ? { available: false, windows: [] } : { available: true, windows: d.windows.length ? d.windows : [{ ...DAY_PRESETS.Afternoon }] }))}
                className={cx('relative h-6 w-11 rounded-full transition', day.available ? 'bg-sage-600' : 'bg-line')}
              >
                <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', day.available ? 'left-[22px]' : 'left-0.5')} />
              </button>
              <span className="font-mono text-[13px] font-medium">{DAY_NAMES[i]}</span>
            </div>
            {day.available ? (
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(DAY_PRESETS) as PresetName[]).map((p) => (
                  <button
                    key={p} type="button" onClick={() => togglePreset(i, p)} aria-pressed={hasPreset(day.windows, p)}
                    className={cx('rounded-full border px-3 py-1 text-[12px] transition',
                      hasPreset(day.windows, p) ? 'border-sage-600 bg-sage-100 text-sage-800' : 'border-line text-ink-soft hover:border-sage-300')}
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : <span className="text-[13px] text-muted">Unavailable</span>}
          </div>

          {day.available && (
            <div className="mt-3 space-y-2 sm:pl-36">
              {day.windows.map((w, wi) => {
                const invalid = toMinutes(w.end) <= toMinutes(w.start);
                return (
                  <div key={wi} className="flex flex-wrap items-center gap-2">
                    <input type="time" value={w.start} aria-label={`${DAY_NAMES[i]} window ${wi + 1} start`}
                      onChange={(e) => setDay(i, (d) => ({ ...d, windows: d.windows.map((x, k) => (k === wi ? { ...x, start: e.target.value } : x)) }))}
                      className={cx('field-input w-[128px] py-1.5', invalid && 'border-rose-deep/60')} />
                    <span className="text-muted">to</span>
                    <input type="time" value={w.end} aria-label={`${DAY_NAMES[i]} window ${wi + 1} end`}
                      onChange={(e) => setDay(i, (d) => ({ ...d, windows: d.windows.map((x, k) => (k === wi ? { ...x, end: e.target.value } : x)) }))}
                      className={cx('field-input w-[128px] py-1.5', invalid && 'border-rose-deep/60')} />
                    <button type="button" aria-label="Remove time window" onClick={() => setDay(i, (d) => {
                      const windows = d.windows.filter((_, k) => k !== wi);
                      return { available: windows.length > 0, windows };
                    })} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-rose-soft hover:text-rose-deep">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {invalid && <span className="text-[12px] text-rose-deep">End must be after start</span>}
                  </div>
                );
              })}
              <Button size="sm" variant="ghost" icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setDay(i, (d) => ({ ...d, windows: [...d.windows, { start: '18:00', end: '19:30' }] }))}>
                Add Time Window
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const availabilityValid = (v: WeeklyAvailability) =>
  v.every((d) => !d.available || d.windows.every((w) => toMinutes(w.end) > toMinutes(w.start)));

export const hasAnyAvailability = (v: WeeklyAvailability) => v.some((d) => d.available && d.windows.length > 0);
