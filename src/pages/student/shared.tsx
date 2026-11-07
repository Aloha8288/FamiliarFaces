import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Mail, Repeat, Send, Undo2, UserCheck } from 'lucide-react';
import { useStore, useStudentView } from '../../lib/store';
import { DEMO_FAMILY_EMAIL } from '../../lib/seed';
import { computeMatch } from '../../lib/matching';
import type { Resident } from '../../lib/types';
import { fmtDate } from '../../lib/time';
import { Avatar, Badge, Button, Card, CardHeader, Field, Modal, Textarea, useToast } from '../../components/ui';
import { residentFirst, shortName } from '../../components/domain';

/** Residents visible to students: seed residents plus family-created profiles that are complete. */
export function useBrowsableResidents() {
  const { data } = useStore();
  return useMemo(() => data.residents.filter((r) => {
    if (!r.familyUserId) return true;
    const fam = data.users.find((u) => u.id === r.familyUserId);
    return !!fam?.onboarded && !!r.fullName.trim();
  }), [data.residents, data.users]);
}

/** Margaret is the featured resident and always appears first. */
const featured = (id: string) => (id === 'res-margaret' ? 1 : 0);

export function useMatches() {
  const { profile } = useStudentView();
  const residents = useBrowsableResidents();
  return useMemo(() => {
    if (!profile) return [];
    return residents.map((r) => ({ r, match: computeMatch(profile, r) })).sort((a, b) => featured(b.r.id) - featured(a.r.id) || b.match.total - a.match.total || a.r.fullName.localeCompare(b.r.fullName));
  }, [profile, residents]);
}

export function RequestModal({ resident, open, onClose }: { resident: Resident | null; open: boolean; onClose: () => void }) {
  const { requestCompanion } = useStore();
  const { profile } = useStudentView();
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  if (!resident) return null;
  const name = residentFirst(resident);
  const send = () => {
    const res = requestCompanion(resident.id, message || `Hi! I'm ${profile?.fullName.split(' ')[0] ?? 'a student'}, and I'd love to visit ${name} regularly.`);
    if (!res.ok) return setError(res.error);
    toast(`Request sent to ${name}'s family.`);
    setMessage(''); setError('');
    onClose();
  };
  return (
    <Modal open={open} onClose={() => { setError(''); onClose(); }} title="Request Companion"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={send} icon={<Send className="h-4 w-4" />}>Send Request</Button></>}>
      <div className="flex items-center gap-3 rounded-2xl bg-cream p-3">
        <Avatar photo={resident.photo} size={44} />
        <div><p className="font-mono text-[14px] font-semibold">{shortName(resident)}</p><p className="text-[12.5px] text-muted">{resident.careHome}</p></div>
      </div>
      <p className="mt-4 text-[14px] text-ink-soft">
        {name}'s family will review your profile and decide whether to accept. Once accepted, you'll begin a Companion Commitment
        with a goal of {profile?.visitsPerWeek ?? 2} {profile?.visitsPerWeek === 1 ? 'visit' : 'visits'} per week.
      </p>
      <Field label="Introduce Yourself to the Family" htmlFor="reqmsg" className="mt-4" hint="Optional, but families love a personal note.">
        <Textarea id="reqmsg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder={`Hi! I noticed ${name} loves ${resident.interests[0]?.toLowerCase() ?? 'conversation'}, so do I…`} />
      </Field>
      {error && <p className="mt-3 rounded-xl bg-rose-soft px-3 py-2 text-[13px] text-rose-deep">{error}</p>}
    </Modal>
  );
}

/** Pending requests with presentation-friendly ways to get a family response. */
export function PendingRequests() {
  const { data, withdrawRequest, decideRequest, switchToDemo } = useStore();
  const { requests } = useStudentView();
  const navigate = useNavigate();
  const toast = useToast();
  const invites = requests.filter((r) => r.status === 'pending' && r.from === 'family');
  const pending = requests.filter((r) => r.status === 'pending' && r.from !== 'family');
  const recentDeclined = requests.filter((r) => r.status === 'declined' && r.from !== 'family').slice(-2);
  if (!pending.length && !recentDeclined.length && !invites.length) return null;

  return (
    <div className="space-y-6">
    {invites.length > 0 && (
      <Card className="border-sage-300">
        <CardHeader title="Families Who Invited You" subtitle="Accept to start a Companion Commitment." icon={<Mail className="h-4 w-4" />} />
        <div className="divide-y divide-line/70">
          {invites.map((req) => {
            const r = data.residents.find((x) => x.id === req.residentId);
            if (!r) return null;
            return (
              <div key={req.id} className="px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar photo={r.photo} size={40} />
                    <div>
                      <p className="text-[14px] font-medium">{shortName(r)} <span className="text-muted">· {r.careHome}</span></p>
                      <p className="text-[12.5px] text-muted">Invited by {r.family.name || 'family'} · {fmtDate(req.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/student/residents/${r.id}`)}>View Profile</Button>
                    <Button size="sm" variant="ghost" onClick={() => { decideRequest(req.id, false); toast('Invitation declined.', 'info'); }}>Decline</Button>
                    <Button size="sm" onClick={() => { const res = decideRequest(req.id, true); if (res.ok) toast(`You're now ${residentFirst(r)}'s companion!`); else toast(res.error, 'error'); }}>Accept</Button>
                  </div>
                </div>
                {req.message && <p className="mt-3 rounded-xl bg-cream px-3.5 py-2.5 text-[13.5px] text-ink-soft">“{req.message}”</p>}
              </div>
            );
          })}
        </div>
      </Card>
    )}
    {(pending.length > 0 || recentDeclined.length > 0) && (
    <Card>
      <CardHeader title="Your Companion Requests" subtitle="Families usually respond within a few days." icon={<Clock className="h-4 w-4" />} />
      <div className="divide-y divide-line/70">
        {[...pending, ...recentDeclined].map((req) => {
          const r = data.residents.find((x) => x.id === req.residentId);
          if (!r) return null;
          const family = r.familyUserId ? data.users.find((u) => u.id === r.familyUserId) : null;
          const isDemoFamily = family?.email === DEMO_FAMILY_EMAIL;
          return (
            <div key={req.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <Avatar photo={r.photo} size={40} />
                <div>
                  <p className="text-[14px] font-medium">{shortName(r)} <span className="text-muted">· {r.careHome}</span></p>
                  <p className="text-[12.5px] text-muted">Sent {fmtDate(req.createdAt)}{req.status === 'declined' && req.decisionNote ? ` · ${req.decisionNote}` : ''}</p>
                </div>
              </div>
              {req.status === 'pending' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="olive">Pending</Badge>
                  {isDemoFamily ? (
                    <Button size="sm" variant="soft" icon={<Repeat className="h-3.5 w-3.5" />} onClick={() => { switchToDemo('family', '/family/requests'); navigate('/family/requests'); toast('Switched to Sarah to review the request.', 'info'); }}>
                      Respond as Sarah
                    </Button>
                  ) : !family ? (
                    <Button size="sm" variant="soft" icon={<UserCheck className="h-3.5 w-3.5" />}
                      onClick={() => { const res = decideRequest(req.id, true, 'Simulated family acceptance'); if (res.ok) toast(`${residentFirst(r)}'s family accepted (simulated). Your commitment has begun!`); else toast(res.error, 'error'); }}>
                      Simulate Family Acceptance
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" icon={<Undo2 className="h-3.5 w-3.5" />} onClick={() => { withdrawRequest(req.id); toast('Request withdrawn.', 'info'); }}>Withdraw</Button>
                </div>
              ) : <Badge tone="neutral">Declined</Badge>}
            </div>
          );
        })}
      </div>
    </Card>
    )}
    </div>
  );
}
