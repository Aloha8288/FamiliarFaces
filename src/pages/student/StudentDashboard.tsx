import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, LogIn, Search } from 'lucide-react';
import { useStudentView } from '../../lib/store';
import { Avatar, Button, Card, CardHeader, EmptyState, PageHeader } from '../../components/ui';
import { CommitmentCard, ScoreRing, VisitRow, residentFirst, shortName } from '../../components/domain';
import { PendingRequests, useMatches } from './shared';

export default function StudentDashboard() {
  const sv = useStudentView();
  const matches = useMatches();
  const navigate = useNavigate();
  const p = sv.profile!;
  const first = p.fullName.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';


  return (
    <div>
      <PageHeader eyebrow={new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
        title={`${greeting}, ${first}`}
        subtitle={sv.commitment && sv.resident ? `${residentFirst(sv.resident)} is looking forward to seeing a familiar face.` : 'Let\'s find someone who\'d love a regular visitor.'}
        action={sv.commitment ? <Button to="/student/visits" icon={<LogIn className="h-4 w-4" />}>{sv.activeVisit ? 'Check Out' : 'Check In'}</Button> : <Button to="/student/find" icon={<Search className="h-4 w-4" />}>Find a Companion</Button>} />

      {sv.activeVisit && sv.resident && (
        <button onClick={() => navigate('/student/visits')} className="mb-6 flex w-full animate-fade-up items-center justify-between gap-3 rounded-2xl border border-clay-300 bg-clay-100/70 px-5 py-4 text-left transition hover:bg-clay-100">
          <span className="flex items-center gap-3">
            <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay-500 opacity-60" /><span className="relative inline-flex h-3 w-3 rounded-full bg-clay-500" /></span>
            <span className="font-mono text-[13.5px] font-medium text-clay-700">Visit with {residentFirst(sv.resident)} in progress</span>
          </span>
          <span className="flex items-center gap-1 font-mono text-[12.5px] text-clay-700">Check Out <ArrowRight className="h-4 w-4" /></span>
        </button>
      )}

      <div className="space-y-6">
        <PendingRequests />
        {sv.commitment && sv.resident ? (
          <div className="animate-fade-up">
            <CommitmentCard commitment={sv.commitment} resident={sv.resident} visits={sv.myVisits} perspective="student"
              action={<Button to="/student/commitment" size="sm" className="!bg-cream/15 !text-cream ring-1 ring-cream/20 hover:!bg-cream/25" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Details</Button>} />
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
              <div className="bg-gradient-to-br from-sage-50 to-olive-100/60 p-6 sm:p-8">
                <p className="label-mono mb-2">Your Next Step</p>
                <h2 className="text-[21px] font-semibold">Find Your Companion</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  We've ranked residents by compatibility with your profile. Send a request, and once their family accepts, your Companion Commitment begins.
                </p>
                <Button to="/student/find" className="mt-5" iconRight={<ArrowRight className="h-4 w-4" />}>Browse Residents</Button>
              </div>
              <div className="min-w-0 divide-y divide-line/70">
                <p className="label-mono px-6 pb-2 pt-5">Your Top Matches</p>
                {matches.slice(0, 3).map(({ r, match }) => (
                  <button key={r.id} onClick={() => navigate(`/student/residents/${r.id}`)} className="flex w-full items-center gap-3 px-6 py-3.5 text-left transition hover:bg-cream/60">
                    <Avatar photo={r.photo} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium">{shortName(r)} <span className="text-muted">· {r.age}</span></p>
                      <p className="truncate text-[12.5px] text-muted">{match.explanation}</p>
                    </div>
                    <ScoreRing score={match.total} size={44} />
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}



        <div>
          <Card>
            <CardHeader title="Upcoming Visits" icon={<CalendarClock className="h-4 w-4" />}
              action={sv.commitment ? <Button size="sm" variant="secondary" to="/student/visits">Schedule</Button> : undefined} />
            {sv.stats.upcoming.length ? (
              <div className="space-y-2.5 p-4">
                {sv.stats.upcoming.slice(0, 3).map((v) => <VisitRow key={v.id} v={v} title={`Visit with ${sv.resident ? residentFirst(sv.resident) : 'your companion'}`} />)}
              </div>
            ) : (
              <EmptyState icon={<CalendarClock className="h-5 w-5" />} title="No Upcoming Visits"
                body={sv.commitment ? 'Plan your next visit to stay on track with your weekly goal.' : 'Once you\'re matched, your scheduled visits will appear here.'}
                action={sv.commitment ? <Button size="sm" to="/student/visits">Schedule a Visit</Button> : undefined} />
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}
