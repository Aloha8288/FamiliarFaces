import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Ear, Footprints, Heart, HeartHandshake, Languages, MapPin, MessageCircle, Music, ShieldAlert, Star } from 'lucide-react';
import { useStore, useStudentView } from '../../lib/store';
import { computeMatch, scoreTone, residentInterests } from '../../lib/matching';
import { DAY_SHORT, NO_PREFERENCE, normalizeTrait } from '../../lib/options';
import { formatWindow } from '../../lib/time';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Notice, cx } from '../../components/ui';
import { MatchBreakdown, ScoreRing, residentFirst, shortName } from '../../components/domain';
import { RequestModal } from './shared';

function Tags({ items, highlight }: { items: string[]; highlight?: Set<string> }) {
  if (!items.length) return <p className="text-[13px] text-muted">Not specified.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => {
        const hit = highlight?.has(i.toLowerCase());
        return <span key={i} className={cx('rounded-full border px-2.5 py-1 text-[12.5px]', hit ? 'border-sage-600 bg-sage-700 text-cream' : 'border-line bg-paper text-ink-soft')}>{i}</span>;
      })}
    </div>
  );
}

function Block({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold"><span className="text-sage-600">{icon}</span>{title}</p>
      {children}
    </div>
  );
}

export default function ResidentDetail() {
  const { id } = useParams();
  const { data } = useStore();
  const { profile, commitment, requests } = useStudentView();
  const navigate = useNavigate();
  const [requesting, setRequesting] = useState(false);
  const r = data.residents.find((x) => x.id === id);

  if (!r || !profile) {
    return <Card><EmptyState icon={<Heart className="h-5 w-5" />} title="Resident Not Found" body="This profile may have been removed." action={<Button to="/student/find">Back to Find a Companion</Button>} /></Card>;
  }

  const match = computeMatch(profile, r);
  const isMine = commitment?.residentId === r.id;
  const pending = requests.some((q) => q.residentId === r.id && q.status === 'pending');
  const takenByOther = !isMine && data.commitments.some((c) => c.active && c.residentId === r.id);
  const shared = new Set(match.sharedInterests.map((s) => s.toLowerCase()));
  const myTraits = new Set(profile.personality.map((t) => normalizeTrait(t).toLowerCase()));
  const traitHits = new Set(r.preferredTraits.filter((t) => myTraits.has(normalizeTrait(t).toLowerCase())).map((t) => t.toLowerCase()));
  const myLangs = new Set(match.sharedLanguages.map((l) => l.toLowerCase()));
  const overlapDays = new Set(match.sharedSlots.map((s) => s.day));
  const name = residentFirst(r);

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Card className="mb-6 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-sage-200 via-olive-100 to-clay-100" />
        <div className="-mt-10 flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar photo={r.photo} name={r.fullName} size={88} className="border-4 border-paper" />
            <div className="pb-1">
              <h1 className="text-[24px] font-semibold">{isMine ? r.fullName : shortName(r)}</h1>
              <p className="text-[13.5px] text-muted">{r.age} years old{r.preferredName !== r.fullName.split(' ')[0] ? ` · Goes by ${r.preferredName}` : ''}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] text-ink-soft"><MapPin className="h-3.5 w-3.5" />{r.careHome}{r.neighbourhood ? ` · ${r.neighbourhood}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isMine ? <Button to="/student/commitment" icon={<HeartHandshake className="h-4 w-4" />}>View Commitment</Button>
              : pending ? <Badge tone="olive" className="!px-3 !py-1.5 !text-[12px]">Request Pending</Badge>
              : takenByOther ? <Badge tone="neutral" className="!px-3 !py-1.5 !text-[12px]">Already Matched</Badge>
              : <Button onClick={() => setRequesting(true)} disabled={!!commitment} title={commitment ? 'You already have an active commitment.' : undefined}>Request Companion</Button>}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-6">
            {r.bio && <p className="text-[15px] leading-relaxed text-ink-soft">{r.bio}</p>}
            <div className={cx('grid gap-6 sm:grid-cols-2', r.bio && 'mt-6 border-t border-line/70 pt-6')}>
              <Block icon={<Heart className="h-4 w-4" />} title="Interests"><Tags items={residentInterests(r)} highlight={shared} /></Block>
              <Block icon={<Languages className="h-4 w-4" />} title="Languages"><Tags items={[...r.languages.filter((l) => l !== 'Other'), ...(r.otherLanguage ? [r.otherLanguage] : [])]} highlight={myLangs} /></Block>
              <Block icon={<Star className="h-4 w-4" />} title="Personality"><Tags items={r.personality} /></Block>
              <Block icon={<HeartHandshake className="h-4 w-4" />} title="Hopes for a Companion Who Is…">
                {r.preferredTraits.includes(NO_PREFERENCE) ? <p className="text-[13px] text-ink-soft">Open to any companion personality.</p> : <Tags items={r.preferredTraits.filter((t) => t !== 'Other').concat(r.otherTrait ? [r.otherTrait] : [])} highlight={traitHits} />}
              </Block>
            </div>
            <p className="mt-5 text-[12px] text-muted"><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-sage-700 align-middle" />Highlighted items are things you have in common.</p>
          </Card>

          <Card>
            <CardHeader title="Connecting With Them" icon={<MessageCircle className="h-4 w-4" />} />
            <div className="space-y-5 p-6">
              <Block icon={<MessageCircle className="h-4 w-4" />} title="Communication Preferences"><Tags items={r.communication.filter((c) => c !== 'Other').concat(r.otherCommunication ? [r.otherCommunication] : [])} /></Block>
              {r.spokenTo && <div className="rounded-2xl bg-cream p-4"><p className="label-mono mb-1">How {name} Prefers to Be Spoken To</p><p className="text-[14px] text-ink-soft">{r.spokenTo}</p></div>}
              <div className="grid gap-5 sm:grid-cols-2">
                {r.favouriteMusic && <Block icon={<Music className="h-4 w-4" />} title="Favourite Music"><p className="text-[13.5px] text-ink-soft">{r.favouriteMusic}</p></Block>}
                {r.favouriteActivities && <Block icon={<Heart className="h-4 w-4" />} title="Favourite Activities"><p className="text-[13.5px] text-ink-soft">{r.favouriteActivities}</p></Block>}
                {r.favouriteTopics && <Block icon={<Star className="h-4 w-4" />} title="Favourite Topics"><p className="text-[13.5px] text-ink-soft">{r.favouriteTopics}</p></Block>}
                {r.sensory && <Block icon={<Ear className="h-4 w-4" />} title="Sensory Preferences"><p className="text-[13.5px] text-ink-soft">{r.sensory}</p></Block>}
              </div>
              {r.mobility.length > 0 && (
                <Block icon={<Footprints className="h-4 w-4" />} title="Activities & Mobility">
                  <Tags items={r.mobility.filter((m) => m !== 'Other').concat(r.otherMobility ? [r.otherMobility] : [])} />
                  <p className="mt-2 text-[12.5px] text-muted">Companions never provide medical care or unsupervised mobility help, always involve staff.</p>
                </Block>
              )}
            </div>
          </Card>

          {isMine && (r.topicsToAvoid.length > 0) && (
            <Notice tone="warn" title="Topics to Avoid">
              <p>Shared with you because you're {name}'s companion: {r.topicsToAvoid.filter((t) => t !== 'Other').concat(r.otherTopic ? [r.otherTopic] : []).join(', ')}.</p>
              <p className="mt-1">If one comes up, gently follow {name}'s lead or change the subject.</p>
            </Notice>
          )}

          <Card>
            <CardHeader title="Preferred Visiting Times" subtitle={r.preferredTimesNote || `Prefers visits of about ${r.visitDuration} minutes.`} icon={<CalendarDays className="h-4 w-4" />} />
            <div className="grid grid-cols-7 gap-1.5 p-5 sm:gap-2">
              {r.availability.map((d, i) => (
                <div key={i} className={cx('min-h-[92px] rounded-xl border p-1.5 text-center sm:p-2', overlapDays.has(i) ? 'border-sage-500 bg-sage-50' : d.available ? 'border-line bg-paper' : 'border-transparent bg-cream/60')}>
                  <p className="font-mono text-[11px] font-semibold">{DAY_SHORT[i]}</p>
                  {d.available ? d.windows.map((w, k) => <p key={k} className="mt-1 text-[10px] leading-tight text-ink-soft sm:text-[11px]">{formatWindow(w)}</p>) : <p className="mt-1 text-[10px] text-muted">—</p>}
                  {overlapDays.has(i) && <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-wide text-sage-700">You're Free</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-4">
              <ScoreRing score={match.total} size={72} />
              <div>
                <p className="label-mono">Compatibility</p>
                <p className="font-mono text-[17px] font-semibold">{scoreTone(match.total)}</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-cream p-3.5 text-[13.5px] leading-relaxed text-ink-soft">{match.explanation}</p>
            <div className="mt-5"><MatchBreakdown match={match} /></div>
            <p className="mt-5 text-[11.5px] leading-relaxed text-muted">
              Scores are calculated from shared interests (30%), preferred companion personality (25%), schedule (20%), languages (15%), and visit preferences (10%). Missing information is scored neutrally.
            </p>
          </Card>
          {!isMine && (
            <div className="flex items-start gap-2 px-1 text-[12px] text-muted">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Some details, like topics to avoid and family contact information, are shared only after a family accepts your request.
            </div>
          )}
        </div>
      </div>
      <RequestModal resident={r} open={requesting} onClose={() => setRequesting(false)} />
    </div>
  );
}
