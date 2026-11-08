import { useMemo, useState } from 'react';
import { BookOpenCheck, Clock, FileCheck2, GraduationCap, HandHeart, Languages, Search, Send } from 'lucide-react';
import { useStore, useFamilyView } from '../../lib/store';
import { computeMatch, explainForFamily, scoreTone, studentInterests } from '../../lib/matching';
import { DAY_NAMES } from '../../lib/options';
import type { StudentProfile } from '../../lib/types';
import { formatWindow } from '../../lib/time';
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, Modal, Notice, PageHeader, Textarea, useToast } from '../../components/ui';
import { MatchBreakdown, ScoreRing, residentFirst } from '../../components/domain';

export default function FindVolunteer() {
  const { data, inviteVolunteer } = useStore();
  const fv = useFamilyView();
  const toast = useToast();
  const r = fv.resident!;
  const name = residentFirst(r);
  const [q, setQ] = useState('');
  const [viewing, setViewing] = useState<StudentProfile | null>(null);
  const [inviting, setInviting] = useState<StudentProfile | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const takenStudents = new Set(data.commitments.filter((c) => c.active).map((c) => c.studentId));
  const pendingWith = new Map(fv.requests.filter((x) => x.status === 'pending').map((x) => [x.studentId, x.from ?? 'student']));

  const volunteers = useMemo(() => {
    const onboarded = new Set(data.users.filter((u) => u.role === 'student' && u.onboarded).map((u) => u.id));
    return Object.values(data.students)
      .filter((s) => onboarded.has(s.userId) && s.fullName.trim())
      .map((s) => ({ s, match: computeMatch(s, r) }))
      .sort((a, b) => b.match.total - a.match.total || a.s.fullName.localeCompare(b.s.fullName));
  }, [data.students, data.users, r]);

  const shown = volunteers.filter(({ s }) => {
    if (takenStudents.has(s.userId) && fv.commitment?.studentId !== s.userId) return false;
    if (!q) return true;
    return [s.fullName, s.program, s.university, ...studentInterests(s)].join(' ').toLowerCase().includes(q.toLowerCase());
  });

  const send = () => {
    if (!inviting) return;
    const res = inviteVolunteer(inviting.userId, message || `Hi ${inviting.fullName.split(' ')[0]}! We think you and ${name} would get along wonderfully.`);
    if (!res.ok) return setError(res.error);
    toast(`Invitation sent to ${inviting.fullName.split(' ')[0]}.`);
    setInviting(null); setMessage(''); setError('');
  };

  return (
    <div>
      <PageHeader eyebrow="Find a Volunteer" title={`Volunteers for ${name}`} subtitle={`Ranked by how well each student fits ${name}'s interests, preferred personality, schedule, and languages.`} />

      {fv.commitment && fv.student && (
        <div className="mb-6"><Notice tone="success" title={`${name} is matched with ${fv.student.fullName}`}>Invitations are paused while a Companion Commitment is active.</Notice></div>
      )}

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input className="pl-10" placeholder="Search by name, program, or interest" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search volunteers" />
      </div>

      {shown.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ s, match }) => {
            const pending = pendingWith.get(s.userId);
            const isMatched = fv.commitment?.studentId === s.userId;
            return (
              <Card key={s.userId} hover className="flex flex-col p-5">
                <div className="flex items-start gap-4">
                  <Avatar photo={s.photo} name={s.fullName} size={56} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[16px] font-semibold">{s.fullName}</h3>
                    <p className="truncate text-[13px] text-muted">{s.program} · {s.yearOfStudy}</p>
                    <p className="truncate text-[12.5px] text-ink-soft">{s.university}</p>
                  </div>
                  <ScoreRing score={match.total} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={match.total >= 60 ? 'sage' : 'neutral'}>{scoreTone(match.total)}</Badge>
                  {isMatched && <Badge tone="sage" icon={<HandHeart className="h-3 w-3" />}>{name}'s Companion</Badge>}
                  {pending === 'family' && <Badge tone="olive" icon={<Clock className="h-3 w-3" />}>Invitation Sent</Badge>}
                  {pending === 'student' && <Badge tone="clay">Requested {name}</Badge>}
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{explainForFamily(match, s, r)}</p>
                <div className="mt-4">
                  <p className="label-mono mb-2">Shared Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.sharedInterests.length ? match.sharedInterests.slice(0, 8).map((i) => <Badge key={i} tone="outline">{i}</Badge>) : <span className="text-[12.5px] text-muted">None yet</span>}
                  </div>
                </div>
                <div className="mt-auto flex gap-2 pt-5">
                  <Button variant="secondary" className="flex-1" onClick={() => setViewing(s)}>View Profile</Button>
                  {pending === 'student' ? <Button className="flex-1" to="/family/requests">Review Request</Button> : (
                    <Button className="flex-1" disabled={!!pending || !!fv.commitment} onClick={() => { setInviting(s); setError(''); }}>
                      {pending ? 'Invited' : 'Invite'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : <Card><EmptyState icon={<GraduationCap className="h-5 w-5" />} title="No Volunteers Found" body="Try a different search." /></Card>}


      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.fullName ?? ''} wide
        footer={viewing && <><Button variant="ghost" onClick={() => setViewing(null)}>Close</Button>
          {!pendingWith.has(viewing.userId) && !fv.commitment && <Button icon={<Send className="h-4 w-4" />} onClick={() => { setInviting(viewing); setViewing(null); }}>Invite</Button>}</>}>
        {viewing && (() => {
          const m = computeMatch(viewing, r);
          return (
            <div className="grid gap-6 md:grid-cols-[1fr_260px]">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar photo={viewing.photo} size={64} />
                  <div><p className="font-mono text-[16px] font-semibold">{viewing.fullName}</p><p className="text-[13px] text-muted">{viewing.program} · {viewing.yearOfStudy} · {viewing.university}</p></div>
                </div>
                <p className="rounded-2xl bg-cream p-3.5 text-[13.5px] text-ink-soft">{explainForFamily(m, viewing, r)}</p>
                <div><p className="label-mono mb-1.5">Personality</p><div className="flex flex-wrap gap-1.5">{viewing.personality.filter((p) => p !== 'Other').map((p) => <Badge key={p} tone="outline">{p}</Badge>)}</div></div>
                <div><p className="label-mono mb-1.5">Interests</p><div className="flex flex-wrap gap-1.5">{studentInterests(viewing).map((i) => <Badge key={i} tone={m.sharedInterests.includes(i) ? 'sage' : 'outline'}>{i}</Badge>)}</div></div>
                <p className="flex items-center gap-2 text-[13px] text-ink-soft"><Languages className="h-4 w-4 text-sage-600" />{viewing.languages.map((l) => `${l.language === 'Other' ? viewing.otherLanguage : l.language} (${l.fluency})`).join(', ')}</p>
                <div><p className="label-mono mb-1.5">Free When {name} Is</p><p className="text-[13px] text-ink-soft">{m.sharedSlots.length ? m.sharedSlots.map((sl) => `${DAY_NAMES[sl.day]} ${formatWindow(sl.windows[0])}`).join(' · ') : 'No overlapping times yet'}</p></div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="olive" icon={<FileCheck2 className="h-3 w-3" />}>VSC Submitted</Badge>
                  <Badge tone="sage" icon={<BookOpenCheck className="h-3 w-3" />}>Orientation Complete</Badge>
                </div>
              </div>
              <div className="rounded-2xl border border-line p-4"><MatchBreakdown match={m} /></div>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!inviting} onClose={() => setInviting(null)} title={`Invite ${inviting?.fullName.split(' ')[0] ?? ''}`}
        footer={<><Button variant="ghost" onClick={() => setInviting(null)}>Cancel</Button><Button icon={<Send className="h-4 w-4" />} onClick={send}>Send Invitation</Button></>}>
        <p className="text-[14px] text-ink-soft">{inviting?.fullName.split(' ')[0]} will see your invitation and can accept to become {name}'s companion.</p>
        <Field label="Message (Optional)" htmlFor="invmsg" className="mt-4">
          <Textarea id="invmsg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Hi! ${name} loves ${r.interests[0]?.toLowerCase() ?? 'company'}…`} />
        </Field>
        {error && <p className="mt-3 rounded-xl bg-rose-soft px-3 py-2 text-[13px] text-rose-deep">{error}</p>}
      </Modal>
    </div>
  );
}
