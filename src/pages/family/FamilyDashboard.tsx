import { BookHeart, ArrowRight, BookOpenCheck, CalendarClock, ClipboardCheck, FileCheck2, GraduationCap, Inbox, Languages } from 'lucide-react';
import { useStore, useFamilyView } from '../../lib/store';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, PageHeader } from '../../components/ui';
import { JournalEntryCard } from '../../components/journal';
import { CommitmentCard, VisitRow, residentFirst } from '../../components/domain';
import { ApprovalRow } from './shared';

export default function FamilyDashboard() {
  const { user } = useStore();
  const fv = useFamilyView();
  const { data } = useStore();
  const latest = fv.resident ? data.journal.find((j) => j.residentId === fv.resident!.id) : undefined;
  const r = fv.resident!;
  const name = residentFirst(r);
  const first = user?.displayName.split(' ')[0] ?? '';
  const pendingReq = fv.requests.filter((q) => q.status === 'pending');
  const s = fv.student;

  return (
    <div>
      <PageHeader eyebrow="Family Dashboard" title={`Welcome, ${first}`}
        subtitle={fv.commitment && s ? `Here's how ${name}'s companionship with ${s.fullName.split(' ')[0]} is going.` : `Let's find a familiar face for ${name}.`}
        action={pendingReq.length ? <Button to="/family/requests" icon={<Inbox className="h-4 w-4" />}>Review {pendingReq.length} {pendingReq.length === 1 ? 'Request' : 'Requests'}</Button> : undefined} />

      <div className="space-y-6">
        {fv.commitment && s ? (
          <div className="animate-fade-up"><CommitmentCard commitment={fv.commitment} resident={r} visits={fv.visits} perspective="family" /></div>
        ) : (
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-6 bg-gradient-to-br from-sage-50 to-olive-100/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-4">
                <Avatar photo={r.photo} size={64} />
                <div>
                  <p className="label-mono mb-1">Companion Status</p>
                  <h2 className="text-[20px] font-semibold">{pendingReq.length ? `${pendingReq.length} ${pendingReq.length === 1 ? 'Student Wants' : 'Students Want'} to Visit ${name}` : `Waiting for ${name}'s Companion`}</h2>
                  <p className="mt-1 text-[14px] text-ink-soft">{pendingReq.length ? 'Review their profiles and choose who feels like the right fit.' : `Browse volunteers and invite one, or wait for a student to request ${name}.`}</p>
                </div>
              </div>
              {pendingReq.length > 0 ? <Button to="/family/requests" iconRight={<ArrowRight className="h-4 w-4" />}>Review Requests</Button> : <Button to="/family/find" iconRight={<ArrowRight className="h-4 w-4" />}>Find a Volunteer</Button>}
            </div>
          </Card>
        )}


        {fv.stats.pendingApprovals.length > 0 && s && (
          <Card>
            <CardHeader title="Pending Hour Approvals" subtitle="Please confirm each visit's hours." icon={<ClipboardCheck className="h-4 w-4" />}
              action={<Button size="sm" variant="ghost" to="/family/visits">View All</Button>} />
            <div className="space-y-2.5 p-4">
              {fv.stats.pendingApprovals.map((v) => <ApprovalRow key={v.id} v={v} studentName={s.fullName} />)}
            </div>
          </Card>
        )}

        {latest && (
          <Card>
            <CardHeader title="Latest From the Journal" icon={<BookHeart className="h-4 w-4" />} action={<Button size="sm" variant="ghost" to="/family/journal">View All</Button>} />
            <div className="p-4"><JournalEntryCard entry={latest} author={data.students[latest.studentId]?.fullName ?? 'Companion'} authorPhoto={data.students[latest.studentId]?.photo} /></div>
          </Card>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Matched Volunteer" icon={<GraduationCap className="h-4 w-4" />} />
            {s ? (
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar photo={s.photo} size={56} />
                  <div>
                    <p className="font-mono text-[16px] font-semibold">{s.fullName}</p>
                    <p className="text-[13px] text-muted">{s.program} · {s.yearOfStudy} · {s.university}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">{s.personality.filter((p) => p !== 'Other').map((p) => <Badge key={p} tone="outline">{p}</Badge>)}</div>
                <p className="mt-3 flex items-center gap-2 text-[13px] text-ink-soft"><Languages className="h-4 w-4 text-sage-600" />{s.languages.map((l) => `${l.language === 'Other' ? s.otherLanguage : l.language} (${l.fluency})`).join(', ')}</p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line/70 pt-4">
                  <Badge tone="olive" icon={<FileCheck2 className="h-3 w-3" />}>VSC Submitted</Badge>
                  {s.trainingCompletedAt && <Badge tone="sage" icon={<BookOpenCheck className="h-3 w-3" />}>Orientation Complete</Badge>}
                </div>
              </div>
            ) : <EmptyState icon={<GraduationCap className="h-5 w-5" />} title="No Companion Yet" body="When you accept a request, the student's details will appear here." />}
          </Card>

          <Card>
            <CardHeader title="Upcoming Visits" icon={<CalendarClock className="h-4 w-4" />} />
            {fv.stats.upcoming.length && s ? (
              <div className="space-y-2.5 p-4">{fv.stats.upcoming.slice(0, 4).map((v) => <VisitRow key={v.id} v={v} title={`${s.fullName.split(' ')[0]} visiting ${name}`} />)}</div>
            ) : <EmptyState icon={<CalendarClock className="h-5 w-5" />} title="No Upcoming Visits" body={s ? `${s.fullName.split(' ')[0]} hasn't scheduled the next visit yet.` : 'Visits appear here once a companion is matched.'} />}
          </Card>
        </div>

      </div>
    </div>
  );
}
