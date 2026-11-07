import { useState } from 'react';
import { BookOpenCheck, Check, FileCheck2, Inbox, Languages, Quote, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Undo2, UserCheck } from 'lucide-react';
import { useStore, useFamilyView } from '../../lib/store';
import { DEMO_STUDENT_EMAIL } from '../../lib/seed';
import { computeMatch, explainForFamily, scoreTone } from '../../lib/matching';
import { calculateAge, fmtDate } from '../../lib/time';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Field, Modal, Notice, PageHeader, Textarea, useToast } from '../../components/ui';
import { MatchBreakdown, ScoreRing, residentFirst } from '../../components/domain';

export default function CompanionRequests() {
  const { data, decideRequest, withdrawRequest, switchToDemo } = useStore();
  const navigate = useNavigate();
  const fv = useFamilyView();
  const toast = useToast();
  const [declining, setDeclining] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const r = fv.resident!;
  const name = residentFirst(r);
  const sent = fv.requests.filter((q) => q.status === 'pending' && q.from === 'family');
  const pending = fv.requests.filter((q) => q.status === 'pending' && q.from !== 'family').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const past = fv.requests.filter((q) => q.status !== 'pending').sort((a, b) => (b.decidedAt ?? '').localeCompare(a.decidedAt ?? ''));

  const accept = (id: string, studentName: string) => {
    const res = decideRequest(id, true);
    if (!res.ok) return toast(res.error, 'error');
    toast(`You accepted ${studentName}. ${name}'s Companion Commitment has begun!`);
  };

  return (
    <div>
      <PageHeader eyebrow="Companion Requests" title="Companion Requests"
        subtitle={`Students who asked to visit ${name}, and volunteers you've invited.`} action={!fv.commitment ? <Button variant="secondary" to="/family/find">Find a Volunteer</Button> : undefined} />

      {fv.commitment && fv.student && (
        <div className="mb-6"><Notice tone="success" title={`${name} is matched with ${fv.student.fullName}`}>New requests can't be accepted while a Companion Commitment is active.</Notice></div>
      )}

      <div className="space-y-5">
        {pending.length === 0 && (
          <Card><EmptyState icon={<Inbox className="h-5 w-5" />} title="No New Requests" body={`When a student asks to visit ${name}, you'll review it here. You can also invite volunteers yourself.`} action={!fv.commitment ? <Button size="sm" to="/family/find">Find a Volunteer</Button> : undefined} /></Card>
        )}
        {pending.map((req) => {
          const s = data.students[req.studentId];
          if (!s) return null;
          const match = computeMatch(s, r);
          const age = calculateAge(s.dob);
          const open = expanded === req.id;
          return (
            <Card key={req.id} className="animate-fade-up overflow-hidden">
              <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
                <Avatar photo={s.photo} name={s.fullName} size={72} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[18px] font-semibold">{s.fullName}</h2>
                    <Badge tone="olive">Pending</Badge>
                  </div>
                  <p className="text-[13.5px] text-muted">{s.program} · {s.yearOfStudy} · {s.university}{age ? ` · Age ${age}` : ''}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">Requested {fmtDate(req.createdAt)}</p>
                  {req.message && (
                    <div className="mt-4 flex gap-2.5 rounded-2xl bg-cream p-4 text-[14px] leading-relaxed text-ink-soft">
                      <Quote className="h-4 w-4 shrink-0 text-sage-500" />{req.message}
                    </div>
                  )}
                  <p className="mt-4 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-[13.5px] text-sage-900">{explainForFamily(match, s, r)}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="label-mono mb-1.5">Personality</p>
                      <div className="flex flex-wrap gap-1.5">{s.personality.filter((x) => x !== 'Other').concat(s.otherPersonality ? [s.otherPersonality] : []).map((p) => <Badge key={p} tone={match.sharedTraits.some((t) => t.startsWith(p)) ? 'sage' : 'outline'}>{p}</Badge>)}</div>
                    </div>
                    <div>
                      <p className="label-mono mb-1.5">Shared Interests</p>
                      <div className="flex flex-wrap gap-1.5">{match.sharedInterests.length ? match.sharedInterests.map((i) => <Badge key={i} tone="sage">{i}</Badge>) : <span className="text-[13px] text-muted">None yet</span>}</div>
                    </div>
                    <div>
                      <p className="label-mono mb-1.5">Languages</p>
                      <p className="flex items-center gap-1.5 text-[13px] text-ink-soft"><Languages className="h-3.5 w-3.5" />{s.languages.map((l) => `${l.language === 'Other' ? s.otherLanguage : l.language} (${l.fluency})`).join(', ')}</p>
                    </div>

                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone="olive" icon={<FileCheck2 className="h-3 w-3" />}>VSC Submitted</Badge>
                    {s.trainingCompletedAt && <Badge tone="sage" icon={<BookOpenCheck className="h-3 w-3" />}>Orientation Complete</Badge>}
                  </div>
                  {open && <div className="mt-5 animate-fade-in rounded-2xl border border-line p-5"><MatchBreakdown match={match} /></div>}
                </div>
                <div className="flex flex-row items-center gap-3 md:flex-col md:items-end">
                  <ScoreRing score={match.total} size={64} />
                  <p className="font-mono text-[12px] text-muted">{scoreTone(match.total)}</p>
                  <button className="font-mono text-[12px] text-sage-700 underline-offset-4 hover:underline" onClick={() => setExpanded(open ? null : req.id)}>{open ? 'Hide Breakdown' : 'Score Breakdown'}</button>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-line/70 bg-cream/40 px-6 py-4">
                <Button variant="danger" icon={<X className="h-4 w-4" />} onClick={() => { setDeclining(req.id); setDeclineNote(''); }}>Decline</Button>
                <Button icon={<Check className="h-4 w-4" />} disabled={!!fv.commitment} onClick={() => accept(req.id, s.fullName.split(' ')[0])}>Accept Companion</Button>
              </div>
            </Card>
          );
        })}

        {sent.length > 0 && (
          <Card>
            <CardHeader title="Invitations You Sent" subtitle="Waiting for the volunteer to respond." />
            <div className="divide-y divide-line/70">
              {sent.map((req) => {
                const s = data.students[req.studentId];
                const u = data.users.find((x) => x.id === req.studentId);
                if (!s) return null;
                return (
                  <div key={req.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar photo={s.photo} size={40} />
                      <div><p className="text-[14px] font-medium">{s.fullName}</p><p className="text-[12.5px] text-muted">Invited {fmtDate(req.createdAt)}</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {u?.email === DEMO_STUDENT_EMAIL ? (
                        <Button size="sm" variant="soft" icon={<Repeat className="h-3.5 w-3.5" />} onClick={() => { switchToDemo('student', '/student'); navigate('/student'); toast('Switched to Alex to respond.', 'info'); }}>Respond as Alex</Button>
                      ) : u?.isSimulated ? (
                        <Button size="sm" variant="soft" icon={<UserCheck className="h-3.5 w-3.5" />} onClick={() => { const res = decideRequest(req.id, true, 'Simulated volunteer acceptance'); if (res.ok) toast(`${s.fullName.split(' ')[0]} accepted (simulated). ${name}'s Companion Commitment has begun!`); else toast(res.error, 'error'); }}>Simulate Acceptance</Button>
                      ) : null}
                      <Button size="sm" variant="ghost" icon={<Undo2 className="h-3.5 w-3.5" />} onClick={() => { withdrawRequest(req.id); toast('Invitation withdrawn.', 'info'); }}>Withdraw</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {past.length > 0 && (
          <Card>
            <CardHeader title="Past Requests" />
            <div className="divide-y divide-line/70">
              {past.map((req) => {
                const s = data.students[req.studentId];
                return (
                  <div key={req.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar photo={s?.photo} size={36} />
                      <div><p className="text-[14px] font-medium">{s?.fullName ?? 'Student'}</p><p className="text-[12px] text-muted">{req.decidedAt ? fmtDate(req.decidedAt) : ''}{req.decisionNote ? ` · ${req.decisionNote}` : ''}</p></div>
                    </div>
                    <Badge tone={req.status === 'accepted' ? 'sage' : 'neutral'}>{req.status === 'accepted' ? 'Accepted' : req.status === 'withdrawn' ? 'Withdrawn' : 'Declined'}{req.from === 'family' ? ' · Invite' : ''}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <Modal open={!!declining} onClose={() => setDeclining(null)} title="Decline This Request?"
        footer={<><Button variant="ghost" onClick={() => setDeclining(null)}>Cancel</Button><Button variant="danger" onClick={() => { decideRequest(declining!, false, declineNote); setDeclining(null); toast('Request declined. The student will see your decision.', 'info'); }}>Decline Request</Button></>}>
        <p className="text-[14px] text-ink-soft">The student will see that this match isn't the right fit. You can include an optional, kind note.</p>
        <Field label="Note to Student (Optional)" htmlFor="dnote" className="mt-4">
          <Textarea id="dnote" value={declineNote} onChange={(e) => setDeclineNote(e.target.value)} placeholder="Thank you so much for your interest…" />
        </Field>
      </Modal>
    </div>
  );
}
