import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandHeart, Info, Search } from 'lucide-react';
import { useStore, useStudentView } from '../../lib/store';
import { CARE_HOMES } from '../../lib/options';
import type { Resident } from '../../lib/types';
import { Card, EmptyState, Input, Notice, PageHeader, Select } from '../../components/ui';
import { ResidentCard } from '../../components/domain';
import { PendingRequests, RequestModal, useMatches } from './shared';

export default function FindCompanion() {
  const { data } = useStore();
  const { commitment, resident: myResident, requests } = useStudentView();
  const matches = useMatches();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [home, setHome] = useState('');
  const [requesting, setRequesting] = useState<Resident | null>(null);

  const homes = useMemo(() => Array.from(new Set([...CARE_HOMES, ...matches.map((m) => m.r.careHome)])).sort(), [matches]);
  const pendingIds = new Set(requests.filter((r) => r.status === 'pending').map((r) => r.residentId));
  const matchedResidentIds = new Set(data.commitments.filter((c) => c.active).map((c) => c.residentId));
  const pendingCount = pendingIds.size;

  const filtered = matches.filter(({ r }) => {
    if (q) {
      const s = q.toLowerCase();
      const hay = [r.fullName, r.preferredName, r.careHome, ...r.interests, ...r.customInterests].join(' ').toLowerCase();
      if (!hay.includes(s)) return false;
    }
    if (home && r.careHome !== home) return false;
    if (matchedResidentIds.has(r.id) && r.id !== myResident?.id) return false;
    return true;
  });

  return (
    <div>
      <PageHeader eyebrow="Find a Companion" title="Residents Looking for a Companion"
        subtitle="Sorted by compatibility with your interests, personality, schedule, and languages. Take your time, this is the start of a long-term friendship." />

      {commitment && myResident && (
        <div className="mb-6">
          <Notice tone="success" title={`You're matched with ${myResident.preferredName || myResident.fullName.split(' ')[0]}`}>
            Companion Commitment focuses on one relationship at a time, so new requests are paused while your commitment is active.{' '}
            <button className="font-medium underline underline-offset-2" onClick={() => navigate('/student/commitment')}>View your commitment</button>
          </Notice>
        </div>
      )}

      <div className="mb-6"><PendingRequests /></div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-10" placeholder="Search by name, interest, or care home" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search residents" />
        </div>
        <Select value={home} onChange={(e) => setHome(e.target.value)} aria-label="Filter by care home" className="sm:w-60">
          <option value="">All Care Homes</option>
          {homes.map((h) => <option key={h}>{h}</option>)}
        </Select>
      </div>

      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ r, match }, i) => {
            const status = myResident?.id === r.id ? 'matched' : pendingIds.has(r.id) ? 'pending' : matchedResidentIds.has(r.id) ? 'unavailable' : null;
            const disabledReason = commitment ? 'You already have an active commitment.' : pendingCount >= 3 ? 'You can have up to 3 pending requests.' : null;
            return (
              <div key={r.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <ResidentCard r={r} match={match} status={status} disabledReason={disabledReason}
                  onView={() => navigate(`/student/residents/${r.id}`)} onRequest={() => setRequesting(r)} />
              </div>
            );
          })}
        </div>
      ) : (
        <Card><EmptyState icon={<HandHeart className="h-5 w-5" />} title="No Residents Match These Filters" body="Try clearing a filter or searching for a different interest." /></Card>
      )}

      <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-[12px] text-muted">
        <Info className="h-3.5 w-3.5" /> Compatibility never uses medical information.
      </p>

      <RequestModal resident={requesting} open={!!requesting} onClose={() => setRequesting(null)} />
    </div>
  );
}
