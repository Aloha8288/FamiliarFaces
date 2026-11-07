import { useState } from 'react';
import { CalendarClock, HandHeart, History, Mail, Minus, Phone, Plus, LogIn, Search, ShieldAlert, UserRound } from 'lucide-react';
import { useStore, useStudentView } from '../../lib/store';
import { fmtDate } from '../../lib/time';
import { Button, Card, CardHeader, EmptyState, Modal, Notice, PageHeader, useToast } from '../../components/ui';
import { CommitmentCard, VisitRow, residentFirst } from '../../components/domain';
import { PendingRequests } from './shared';

export default function MyCommitment() {
  const { updateCommitmentGoal, endCommitment } = useStore();
  const sv = useStudentView();
  const toast = useToast();
  const [ending, setEnding] = useState(false);

  if (!sv.commitment || !sv.resident) {
    return (
      <div>
        <PageHeader eyebrow="My Commitment" title="Companion Commitment" subtitle="One student. One resident. Regular visits that turn into a real friendship." />
        <div className="space-y-6">
          <Card><EmptyState icon={<HandHeart className="h-5 w-5" />} title="You Don't Have a Commitment Yet"
            body="Request a companion, and once their family accepts, your weekly commitment and progress will appear here."
            action={<Button to="/student/find" icon={<Search className="h-4 w-4" />}>Find a Companion</Button>} /></Card>
          <PendingRequests />
        </div>
      </div>
    );
  }

  const c = sv.commitment;
  const r = sv.resident;
  const name = residentFirst(r);
  const history = sv.myVisits.filter((v) => v.commitmentId === c.id && v.status !== 'scheduled').sort((a, b) => (b.checkInAt ?? b.scheduledStart).localeCompare(a.checkInAt ?? a.scheduledStart));
  const topics = r.topicsToAvoid.filter((t) => t !== 'Other').concat(r.otherTopic ? [r.otherTopic] : []);

  return (
    <div>
      <PageHeader eyebrow="My Commitment" title={`You & ${name}`} subtitle={`Matched on ${fmtDate(c.matchedAt)}. Small, steady visits make the biggest difference.`}
        action={<><Button to="/student/visits" variant="secondary" icon={<CalendarClock className="h-4 w-4" />}>Schedule</Button><Button to="/student/visits" icon={<LogIn className="h-4 w-4" />}>Check In</Button></>} />

      <div className="space-y-6">
        <CommitmentCard commitment={c} resident={r} visits={sv.myVisits} perspective="student" />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Weekly Visit Goal" subtitle="Choose a goal you can keep, consistency matters more than quantity." icon={<HandHeart className="h-4 w-4" />} />
            <div className="flex items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" aria-label="Decrease goal" disabled={c.weeklyGoal <= 1} onClick={() => updateCommitmentGoal(c.id, c.weeklyGoal - 1)} icon={<Minus className="h-4 w-4" />} />
                <p className="w-28 text-center font-mono text-[22px] font-semibold">{c.weeklyGoal} <span className="text-[13px] font-normal text-muted">{c.weeklyGoal === 1 ? 'visit' : 'visits'}</span></p>
                <Button variant="secondary" size="sm" aria-label="Increase goal" disabled={c.weeklyGoal >= 5} onClick={() => updateCommitmentGoal(c.id, c.weeklyGoal + 1)} icon={<Plus className="h-4 w-4" />} />
              </div>
              <p className="text-right text-[12.5px] text-muted">per week</p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Family Contact" subtitle={`Shared with you as ${name}'s companion.`} icon={<UserRound className="h-4 w-4" />} />
            <div className="space-y-2 p-6 text-[14px]">
              <p className="font-medium">{r.family.name || 'Family member'} <span className="font-normal text-muted">· {r.family.relationship || 'Family'}</span></p>
              {r.family.email && <p className="flex items-center gap-2 text-ink-soft"><Mail className="h-4 w-4 text-sage-600" />{r.family.email}</p>}
              {r.family.phone && <p className="flex items-center gap-2 text-ink-soft"><Phone className="h-4 w-4 text-sage-600" />{r.family.phone}</p>}
              {!r.family.name && <p className="text-muted">Contact details are managed by the care home for this resident.</p>}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title={`Getting to Know ${name}`} icon={<UserRound className="h-4 w-4" />} action={<Button size="sm" variant="ghost" to={`/student/residents/${r.id}`}>Full Profile</Button>} />
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <div>
              <p className="label-mono mb-1.5">How to Connect</p>
              <p className="text-[14px] leading-relaxed text-ink-soft">{r.spokenTo || 'Be warm, patient, and follow their lead.'}</p>
            </div>
            <div>
              <p className="label-mono mb-1.5">Conversation Starters</p>
              <p className="text-[14px] leading-relaxed text-ink-soft">{r.favouriteTopics || r.interests.slice(0, 3).join(', ')}</p>
            </div>
            {topics.length > 0 && (
              <div className="md:col-span-2">
                <Notice tone="warn" title="Topics to Avoid"><span className="flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" />{topics.join(' · ')}</span></Notice>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Visit History" subtitle="Every visit is kept, even after weekly progress resets." icon={<History className="h-4 w-4" />} />
          <div className="space-y-2.5 p-4">
            {history.length ? history.map((v) => <VisitRow key={v.id} v={v} title={`Visit with ${name}`} />)
              : <EmptyState icon={<History className="h-5 w-5" />} title="Your Story Starts Here" body={`After your first visit with ${name}, it will appear here.`} />}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="ghost" className="!text-rose-deep" onClick={() => setEnding(true)}>End Commitment</Button>
        </div>
      </div>

      <Modal open={ending} onClose={() => setEnding(false)} title="End Your Companion Commitment?"
        footer={<><Button variant="ghost" onClick={() => setEnding(false)}>Keep Commitment</Button><Button variant="danger" onClick={() => { endCommitment(c.id); setEnding(false); toast('Your commitment has ended. Thank you for every visit.', 'info'); }}>End Commitment</Button></>}>
        <p className="text-[14px] leading-relaxed text-ink-soft">
          Ending a commitment cancels upcoming visits. Your completed visits and approved hours stay in your history.
          If possible, please talk with {r.family.name || `${name}'s family`} first so {name} can say goodbye.
        </p>
      </Modal>
    </div>
  );
}
