import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CalendarPlus, History, LogIn, LogOut, Search, Star, X } from 'lucide-react';
import { useStore, useStudentView } from '../../lib/store';
import { DEMO_CHECKIN_CODE, DURATIONS } from '../../lib/options';
import { combineDateTime, fmtDuration, fmtHours, fmtTime, formatClock, mondayIndex, overlapWindows, toLocalDateInput, toMinutes, fromMinutes } from '../../lib/time';
import { Badge, Button, Card, CardHeader, EmptyState, Field, Input, Modal, Notice, PageHeader, Select, cx, useToast } from '../../components/ui';
import { VisitRow, residentFirst } from '../../components/domain';
import { JournalFields } from '../../components/journal';
import type { Mood } from '../../lib/types';

function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

const elapsed = (fromIso: string, now: number) => {
  const s = Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h ? `${h}:` : ''}${String(m).padStart(h ? 2 : 1, '0')}:${String(sec).padStart(2, '0')}`;
};

/* ---------------- Check-in / out ---------------- */
function CheckInPanel() {
  const { checkIn, checkOut, addJournalEntry } = useStore();
  const sv = useStudentView();
  const toast = useToast();
  const now = useNow();
  const [jr, setJr] = useState<{ talkedAbout: string; enjoyed: string; mood: Mood | null }>({ talkedAbout: '', enjoyed: '', mood: null });
  const r = sv.resident!;
  const name = residentFirst(r);
  const active = sv.activeVisit;

  // Use today's scheduled visit (closest to now) if there is one.
  const todayVisit = useMemo(() => {
    const today = new Date().toDateString();
    return sv.stats.upcoming.filter((v) => new Date(v.scheduledStart).toDateString() === today)
      .sort((a, b) => Math.abs(new Date(a.scheduledStart).getTime() - Date.now()) - Math.abs(new Date(b.scheduledStart).getTime() - Date.now()))[0] ?? null;
  }, [sv.stats.upcoming]);

  const doCheckIn = () => {
    const res = checkIn(DEMO_CHECKIN_CODE, todayVisit?.id ?? null);
    if (!res.ok) return toast(res.error, 'error');
    toast(`Checked in at ${fmtTime(new Date().toISOString())}, enjoy your visit with ${name}!`);
  };

  const doCheckOut = () => {
    if (!active) return;
    // The visit is logged at its planned length and sent to the family for approval.
    const visitId = active.id;
    const res = checkOut(jr.talkedAbout, active.plannedMinutes);
    if (!res.ok) return toast(res.error, 'error');
    if (jr.talkedAbout.trim() || jr.enjoyed.trim()) addJournalEntry({ ...jr, visitId });
    setJr({ talkedAbout: '', enjoyed: '', mood: null });
    toast(`Visit logged: ${fmtDuration(active.plannedMinutes)} with ${name}. Sent to the family for approval.`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Check In" subtitle={r.careHome} icon={<LogIn className="h-4 w-4" />}
        action={active ? <Badge tone="clay" icon={<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-500" />}>Visit Active</Badge> : undefined} />
      <div className="p-5 sm:p-6">
        {active ? (
          <div className="animate-fade-in">
            <p className="label-mono">Visit In Progress</p>
            <p className="mt-1 font-mono text-[40px] font-semibold tabular-nums">{elapsed(active.checkInAt!, now)}</p>
            <p className="text-[13.5px] text-ink-soft">With {name} · Checked in at {fmtTime(active.checkInAt!)} · {fmtDuration(active.plannedMinutes)} visit</p>
            <div className="mt-5 rounded-2xl border border-line/80 bg-cream/50 p-4">
              <p className="mb-3 text-[13px] text-ink-soft"><strong className="font-medium text-ink">Journal (optional):</strong> saved with this visit and shared with {name}'s family.</p>
              <JournalFields name={name} {...jr} idPrefix="co" onChange={(patch) => setJr((d) => ({ ...d, ...patch }))} />
            </div>
            <Button size="lg" className="mt-4 w-full sm:w-auto" onClick={doCheckOut} icon={<LogOut className="h-4 w-4" />}>Check Out & Log Visit</Button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] text-ink-soft">
              {todayVisit ? <>Your visit with {name} is scheduled for <strong className="font-medium text-ink">{fmtTime(todayVisit.scheduledStart)}</strong> today.</> : <>Arrived at {r.careHome}? Check in to start your visit with {name}.</>}
            </p>
            <Button size="lg" onClick={doCheckIn} icon={<LogIn className="h-4 w-4" />}>Check In</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ---------------- Scheduling ---------------- */
function SchedulePanel() {
  const { scheduleVisit, data } = useStore();
  const sv = useStudentView();
  const toast = useToast();
  const p = sv.profile!;
  const r = sv.resident!;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [minutes, setMinutes] = useState(p.visitDuration || 60);
  const [error, setError] = useState('');

  // Build suggestions over the next 14 days from the student's availability (and highlight overlap with the resident).
  const suggestions = useMemo(() => {
    const out: { date: string; label: string; start: string; both: boolean }[] = [];
    const now = new Date();
    for (let i = 0; i < 14 && out.length < 8; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const idx = mondayIndex(d);
      const mine = p.availability[idx];
      if (!mine?.available) continue;
      const theirs = r.availability[idx];
      const overlap = theirs?.available ? overlapWindows(mine.windows, theirs.windows).filter((w) => toMinutes(w.end) - toMinutes(w.start) >= minutes) : [];
      const candidates = overlap.length ? overlap.map((w) => ({ start: w.start, both: true })) : mine.windows.filter((w) => toMinutes(w.end) - toMinutes(w.start) >= minutes).map((w) => ({ start: w.start, both: false }));
      for (const c of candidates.slice(0, 1)) {
        // Round start up to the next quarter hour, and skip times that have already passed today.
        const startMin = Math.ceil(toMinutes(c.start) / 15) * 15;
        if (i === 0) { const nowMin = now.getHours() * 60 + now.getMinutes() + 30; if (startMin < nowMin) continue; }
        const start = fromMinutes(startMin);
        const ds = toLocalDateInput(d);
        const taken = data.visits.some((v) => v.studentId === p.userId && v.status === 'scheduled' && toLocalDateInput(new Date(v.scheduledStart)) === ds);
        if (taken) continue;
        out.push({ date: ds, start, both: c.both, label: d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }) });      }
    }
    return out;
  }, [p.availability, r.availability, minutes, data.visits, p.userId]);

  const chosen = date && time ? combineDateTime(date, time) : null;
  const chosenIdx = chosen ? mondayIndex(chosen) : -1;
  const inMyAvail = chosen && p.availability[chosenIdx]?.windows.some((w) => toMinutes(w.start) <= toMinutes(time) && toMinutes(time) + minutes <= toMinutes(w.end));

  const submit = () => {
    if (!date || !time) return setError('Please choose a date and time.');
    const res = scheduleVisit(sv.commitment!.id, combineDateTime(date, time), minutes);
    if (!res.ok) return setError(res.error);
    setError(''); setDate(''); setTime('');
    toast(`Visit scheduled with ${residentFirst(r)}.`);
  };

  return (
    <Card>
      <CardHeader title="Schedule a Visit" subtitle="Suggestions come from your weekly availability." icon={<CalendarPlus className="h-4 w-4" />} />
      <div className="p-5 sm:p-6">
        {suggestions.length > 0 ? (
          <>
            <p className="label-mono mb-2.5">Suggested Times</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => {
                const sel = date === s.date && time === s.start;
                return (
                  <button key={s.date + s.start} type="button" onClick={() => { setDate(s.date); setTime(s.start); setError(''); }}
                    className={cx('rounded-xl border px-3 py-2 text-left transition', sel ? 'border-sage-700 bg-sage-700 text-cream' : 'border-line bg-paper hover:border-sage-300 hover:bg-sage-50')}>
                    <span className="block font-mono text-[12.5px] font-medium">{s.label}</span>
                    <span className={cx('flex items-center gap-1 text-[11.5px]', sel ? 'text-cream/80' : 'text-muted')}>
                      {formatClock(s.start)}{s.both && <><Star className="h-3 w-3" />Both free</>}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <Notice>No open times in your availability over the next two weeks. Pick any date and time below, or update your availability in your profile.</Notice>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <Field label="Date" htmlFor="sdate"><Input id="sdate" type="date" min={toLocalDateInput(new Date())} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Start Time" htmlFor="stime"><Input id="stime" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          <Field label="Duration" htmlFor="sdur">
            <Select id="sdur" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
              {DURATIONS.map((d) => <option key={d} value={d}>{fmtDuration(d)}</option>)}
            </Select>
          </Field>
          <Button onClick={submit} icon={<CalendarPlus className="h-4 w-4" />} className="h-[46px]">Schedule</Button>
        </div>
        {chosen && !inMyAvail && <p className="mt-2 text-[12.5px] text-clay-700">This time is outside your saved availability, that's okay, just make sure it works for you.</p>}
        {error && <p className="mt-3 rounded-xl bg-rose-soft px-3 py-2 text-[13px] text-rose-deep" role="alert">{error}</p>}
      </div>
    </Card>
  );
}

export default function VisitsHours() {
  const { cancelVisit } = useStore();
  const sv = useStudentView();
  const toast = useToast();
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [cancelId, setCancelId] = useState<string | null>(null);

  if (!sv.commitment || !sv.resident) {
    const past = sv.myVisits.filter((v) => v.status === 'completed');
    return (
      <div>
        <PageHeader eyebrow="Visits & Hours" title="Visits & Hours" />
        <Card><EmptyState icon={<CalendarClock className="h-5 w-5" />} title="Start With a Companion" body="Scheduling and check-in open once a family accepts your companion request." action={<Button to="/student/find" icon={<Search className="h-4 w-4" />}>Find a Companion</Button>} /></Card>
        {past.length > 0 && <p className="mt-4 text-center text-[13px] text-muted">You have {past.length} completed visits from a past commitment · {fmtHours(sv.approvedMinutesAll)} approved.</p>}
      </div>
    );
  }

  const name = residentFirst(sv.resident);
  const completed = sv.myVisits.filter((v) => v.status === 'completed').sort((a, b) => (b.checkOutAt ?? '').localeCompare(a.checkOutAt ?? ''));
  const cancelled = sv.myVisits.filter((v) => v.status === 'cancelled');

  return (
    <div>
      <PageHeader eyebrow="Visits & Hours" title={`Visits With ${name}`}
        subtitle={`This week: ${sv.stats.completedThisWeek} of ${sv.stats.goal} visits completed toward your Companion Commitment.`} />


      <div className="space-y-6">
        <CheckInPanel />
        <SchedulePanel />

        <Card>
          <div className="flex items-center gap-1 border-b border-line/70 px-3 pt-3" role="tablist">
            {([['upcoming', `Upcoming (${sv.stats.upcoming.length})`, CalendarClock], ['completed', `Completed (${completed.length})`, History]] as const).map(([k, label, Icon]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={cx('-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-[12.5px] transition', tab === k ? 'border-sage-700 text-ink' : 'border-transparent text-muted hover:text-ink')}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
          <div className="space-y-2.5 p-4">
            {tab === 'upcoming' && (sv.stats.upcoming.length ? sv.stats.upcoming.map((v) => (
              <VisitRow key={v.id} v={v} title={`Visit with ${name}`}
                actions={<Button size="sm" variant="ghost" icon={<X className="h-3.5 w-3.5" />} onClick={() => setCancelId(v.id)}>Cancel</Button>} />
            )) : <EmptyState icon={<CalendarClock className="h-5 w-5" />} title="Nothing Scheduled Yet" body="Pick a suggested time above to plan your next visit." />)}
            {tab === 'completed' && (completed.length ? completed.map((v) => (
              <VisitRow key={v.id} v={v} title={`Visit with ${name}`}>
                {(v.studentNote || v.familyNote) && (
                  <div className="mt-3 space-y-1.5 border-t border-line/60 pt-3 text-[13px]">
                    {v.studentNote && <p className="text-ink-soft"><span className="font-medium text-ink">Your note:</span> {v.studentNote}</p>}
                    {v.familyNote && <p className="text-ink-soft"><span className="font-medium text-ink">Family note:</span> {v.familyNote}</p>}
                  </div>
                )}
              </VisitRow>
            )) : <EmptyState icon={<History className="h-5 w-5" />} title="No Completed Visits Yet" body="After you check out, visits appear here with their approval status." />)}
            {tab === 'upcoming' && cancelled.length > 0 && <p className="px-1 pt-2 text-[12px] text-muted">{cancelled.length} cancelled {cancelled.length === 1 ? 'visit' : 'visits'} hidden.</p>}
          </div>
        </Card>
      </div>

      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel This Visit?"
        footer={<><Button variant="ghost" onClick={() => setCancelId(null)}>Keep Visit</Button><Button variant="danger" onClick={() => { cancelVisit(cancelId!); setCancelId(null); toast('Visit cancelled. The family can see the change.', 'info'); }}>Cancel Visit</Button></>}>
        <p className="text-[14px] text-ink-soft">Consistency means a lot to {name}. If you can, reschedule for another time this week so your commitment stays on track.</p>
      </Modal>
    </div>
  );
}
