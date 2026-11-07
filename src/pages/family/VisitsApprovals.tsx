import { useState } from 'react';
import { CalendarClock, ClipboardCheck, Clock, History } from 'lucide-react';
import { useStore, useFamilyView } from '../../lib/store';
import { Card, EmptyState, PageHeader, cx } from '../../components/ui';
import { VisitRow, residentFirst } from '../../components/domain';
import { ApprovalRow } from './shared';

export default function VisitsApprovals() {
  const { data } = useStore();
  const fv = useFamilyView();
  const [tab, setTab] = useState<'pending' | 'upcoming' | 'history'>('pending');
  const r = fv.resident!;
  const name = residentFirst(r);
  const studentName = (id: string) => data.students[id]?.fullName ?? 'Volunteer';

  const completed = fv.visits.filter((v) => v.status === 'completed').sort((a, b) => (b.checkOutAt ?? '').localeCompare(a.checkOutAt ?? ''));
  const pending = completed.filter((v) => v.approval === 'pending');
  const upcoming = fv.visits.filter((v) => v.status === 'scheduled' && new Date(v.scheduledStart).getTime() + v.plannedMinutes * 60000 > Date.now()).sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));
  const active = fv.visits.find((v) => v.status === 'active');

  const tabs = [
    { k: 'pending' as const, label: `Pending Approval (${pending.length})`, icon: Clock },
    { k: 'upcoming' as const, label: `Upcoming (${upcoming.length})`, icon: CalendarClock },
    { k: 'history' as const, label: `All Completed (${completed.length})`, icon: History },
  ];

  return (
    <div>
      <PageHeader eyebrow="Visits & Approvals" title={`${name}'s Visits`}
        subtitle="Review each completed visit. Only the hours you approve count toward the student's verified volunteer hours." />


      {active && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-clay-300 bg-clay-100/70 px-5 py-4">
          <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay-500 opacity-60" /><span className="relative inline-flex h-3 w-3 rounded-full bg-clay-500" /></span>
          <p className="font-mono text-[13.5px] text-clay-700">{studentName(active.studentId).split(' ')[0]} is visiting {name} right now.</p>
        </div>
      )}

      <Card>
        <div className="flex gap-1 overflow-x-auto border-b border-line/70 px-3 pt-3" role="tablist">
          {tabs.map(({ k, label, icon: Icon }) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={cx('-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-[12.5px] transition', tab === k ? 'border-sage-700 text-ink' : 'border-transparent text-muted hover:text-ink')}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
        <div className="space-y-2.5 p-4">
          {tab === 'pending' && (pending.length ? pending.map((v) => <ApprovalRow key={v.id} v={v} studentName={studentName(v.studentId)} />)
            : <EmptyState icon={<ClipboardCheck className="h-5 w-5" />} title="You're All Caught Up" body="Completed visits will appear here for your approval." />)}
          {tab === 'upcoming' && (upcoming.length ? upcoming.map((v) => <VisitRow key={v.id} v={v} title={`${studentName(v.studentId)} visiting ${name}`} />)
            : <EmptyState icon={<CalendarClock className="h-5 w-5" />} title="No Upcoming Visits" body="Scheduled visits will appear here." />)}
          {tab === 'history' && (completed.length ? completed.map((v) => <ApprovalRow key={v.id} v={v} studentName={studentName(v.studentId)} />)
            : <EmptyState icon={<History className="h-5 w-5" />} title="No Completed Visits Yet" body="After a companion checks out, the visit will be recorded here." />)}
        </div>
      </Card>
    </div>
  );
}
