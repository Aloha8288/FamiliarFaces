import type { ReactNode } from 'react';
import { CalendarClock, CalendarDays, CheckCircle2, Clock, HandHeart, MapPin, Star, Timer, XCircle } from 'lucide-react';
import type { Commitment, Resident, Visit } from '../lib/types';
import type { MatchResult } from '../lib/matching';
import { scoreTone } from '../lib/matching';
import { commitmentStats } from '../lib/store';
import { fmtDate, fmtDateTime, fmtDuration, fmtHours, fmtTime } from '../lib/time';
import { Avatar, Badge, Button, Card, ProgressBar, cx } from './ui';

export const residentFirst = (r: Resident) => r.preferredName || r.fullName.split(' ')[0];
/** First name + last initial, to keep resident identities private while browsing. */
export const shortName = (r: Resident) => {
  const parts = r.fullName.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
};

export function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const stroke = 5;
  const rad = (size - stroke) / 2;
  const circ = 2 * Math.PI * rad;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} aria-label={`Compatibility ${score}%`} role="img">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={rad} stroke="var(--color-sand)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={rad} stroke="var(--color-sage-600)" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} style={{ transition: 'stroke-dashoffset .8s ease-out' }} />
      </svg>
      <span className={cx("absolute font-mono font-semibold", size < 50 ? "text-[11.5px]" : "text-[14px]")}>{score}<span className="text-[10px] text-muted">%</span></span>
    </div>
  );
}

export function MatchBreakdown({ match }: { match: MatchResult }) {
  return (
    <div className="space-y-3.5">
      {match.factors.map((f) => (
        <div key={f.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <p className="text-[13px] font-medium">{f.label} <span className="font-mono text-[11px] text-muted">· {f.weight}%</span></p>
            <p className="font-mono text-[12px] text-ink-soft">{Math.round(f.score * f.weight)} / {f.weight}</p>
          </div>
          <ProgressBar value={f.score * 100} size="sm" label={f.label} />
          <p className="mt-1 text-[12px] text-muted">{f.detail}</p>
        </div>
      ))}
    </div>
  );
}

export function ResidentCard({ r, match, status, onView, onRequest, disabledReason }: {
  r: Resident; match: MatchResult; status?: 'pending' | 'matched' | 'unavailable' | null;
  onView: () => void; onRequest: () => void; disabledReason?: string | null;
}) {
  return (
    <Card hover className="flex flex-col p-5">
      <div className="flex items-start gap-4">
        <Avatar photo={r.photo} name={r.fullName} size={56} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[16px] font-semibold">{shortName(r)}</h3>
          <p className="text-[13px] text-muted">{r.age} years old{r.preferredName && r.preferredName !== r.fullName.split(' ')[0] ? ` · Goes by ${r.preferredName}` : ''}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[12.5px] text-ink-soft"><MapPin className="h-3 w-3 shrink-0" />{r.careHome}</p>
        </div>
        <ScoreRing score={match.total} />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Badge tone={match.total >= 60 ? 'sage' : 'neutral'}>{scoreTone(match.total)}</Badge>
        {status === 'pending' && <Badge tone="olive" icon={<Clock className="h-3 w-3" />}>Request Pending</Badge>}
        {status === 'matched' && <Badge tone="sage" icon={<HandHeart className="h-3 w-3" />}>Your Companion</Badge>}
        {status === 'unavailable' && <Badge tone="neutral">Already Matched</Badge>}
      </div>
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{match.explanation}</p>
      <div className="mt-4">
        <p className="label-mono mb-2">Shared Interests</p>
        <div className="flex flex-wrap gap-1.5">
          {match.sharedInterests.length ? match.sharedInterests.slice(0, 8).map((i) => <Badge key={i} tone="outline">{i}</Badge>)
            : <span className="text-[12.5px] text-muted">No shared interests yet, still could be a lovely match.</span>}
        </div>
      </div>
      <div className="mt-auto flex gap-2 pt-5">
        <Button variant="secondary" className="flex-1" onClick={onView}>View Profile</Button>
        <Button className="flex-1" onClick={onRequest} disabled={!!status || !!disabledReason} title={disabledReason ?? undefined}>
          {status === 'pending' ? 'Requested' : status === 'matched' ? 'Matched' : 'Request Companion'}
        </Button>
      </div>
    </Card>
  );
}

/** The signature Companion Commitment card. */
export function CommitmentCard({ commitment, resident, visits, perspective, action }: {
  commitment: Commitment; resident: Resident; visits: Visit[]; perspective: 'student' | 'family'; action?: ReactNode; studentName?: string;
}) {
  const stats = commitmentStats(visits.filter((v) => v.commitmentId === commitment.id), commitment);
  const met = stats.completedThisWeek >= stats.goal;
  const name = residentFirst(resident);
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-sage-700 bg-gradient-to-br from-sage-700 via-sage-700 to-sage-800 p-6 text-cream shadow-[0_30px_60px_-30px_rgba(58,74,53,.9)] sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sage-500/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-olive-500/20 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar photo={resident.photo} name={resident.fullName} size={56} className="border-cream/30" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sage-200">{perspective === 'student' ? 'Your Companion Commitment' : 'Companion Commitment'}</p>
              <h2 className="mt-1 text-[22px] font-semibold !text-cream sm:text-[26px]">{perspective === 'student' ? name : `${name}'s Companion`}</h2>
              <p className="text-[13px] text-cream/70">{resident.careHome} · Matched {fmtDate(commitment.matchedAt)}</p>
            </div>
          </div>
          {action}
        </div>

        <div className="mt-7">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-[14px]">
              <span className="text-[26px] font-semibold">{stats.completedThisWeek}</span>
              <span className="text-cream/70"> of {stats.goal} {stats.goal === 1 ? 'Visit' : 'Visits'} this week</span>
            </p>
            <p className="font-mono text-[13px] text-sage-200">{met ? 'Weekly Goal Met' : `Progress: ${stats.percent}%`}</p>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-sage-900/40" role="progressbar" aria-valuenow={stats.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Weekly commitment progress">
            <div className="h-full rounded-full bg-gradient-to-r from-sage-300 to-cream transition-[width] duration-700 ease-out" style={{ width: `${stats.percent}%` }} />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] text-cream/55">
            {Array.from({ length: stats.goal + 1 }, (_, i) => <span key={i}>{i}</span>)}
          </div>
          <p className="mt-1 text-[12px] text-cream/60">Weekly progress resets every Monday. All past visits stay in your history.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: <Star className="h-3.5 w-3.5" />, label: 'Weekly Goal', value: `${stats.goal} ${stats.goal === 1 ? 'Visit' : 'Visits'}` },
            { icon: <CalendarClock className="h-3.5 w-3.5" />, label: 'Next Visit', value: stats.next ? fmtDateTime(stats.next.scheduledStart) : 'Not Scheduled' },
            { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Total Visits', value: String(stats.totalCompleted) },
            { icon: <Timer className="h-3.5 w-3.5" />, label: 'Approved Hours', value: fmtHours(stats.approvedMinutes) },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-cream/10 p-3.5 ring-1 ring-cream/10 backdrop-blur">
              <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-sage-200">{s.icon}{s.label}</p>
              <p className="mt-1.5 font-mono text-[13.5px] font-medium leading-snug">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VisitStatusBadge({ v }: { v: Visit }) {
  if (v.status === 'active') return <Badge tone="clay" icon={<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-500" />}>In Progress</Badge>;
  if (v.status === 'scheduled') return <Badge tone="outline" icon={<CalendarDays className="h-3 w-3" />}>Scheduled</Badge>;
  if (v.status === 'cancelled') return <Badge tone="neutral" icon={<XCircle className="h-3 w-3" />}>Cancelled</Badge>;
  if (v.approval === 'approved') return <Badge tone="sage" icon={<CheckCircle2 className="h-3 w-3" />}>Hours Approved</Badge>;
  if (v.approval === 'disputed') return <Badge tone="rose">Hours Disputed</Badge>;
  return <Badge tone="olive" icon={<Clock className="h-3 w-3" />}>Awaiting Approval</Badge>;
}

export function VisitRow({ v, title, actions, children }: { v: Visit; title: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  const done = v.status === 'completed';
  return (
    <div className={cx('rounded-2xl border border-line/80 bg-paper p-4 transition', v.status === 'active' && 'border-clay-300 bg-clay-100/40')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl font-mono', done ? 'bg-sage-100 text-sage-700' : 'bg-cream text-ink-soft')}>
            <div className="text-center leading-none">
              <div className="text-[9.5px] uppercase">{new Date(done && v.checkOutAt ? v.checkOutAt : v.scheduledStart).toLocaleDateString('en-CA', { month: 'short' })}</div>
              <div className="text-[16px] font-semibold">{new Date(done && v.checkOutAt ? v.checkOutAt : v.scheduledStart).getDate()}</div>
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium">{title}</p>
            <p className="text-[12.5px] text-muted">
              {done && v.checkInAt && v.checkOutAt
                ? `${fmtTime(v.checkInAt)} – ${fmtTime(v.checkOutAt)} · ${fmtDuration(v.minutes)}`
                : v.status === 'active' && v.checkInAt ? `Checked in at ${fmtTime(v.checkInAt)}`
                : `${fmtDateTime(v.scheduledStart)} · ${fmtDuration(v.plannedMinutes)}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VisitStatusBadge v={v} />
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}
