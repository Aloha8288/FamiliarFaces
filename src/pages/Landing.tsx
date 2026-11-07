import { ArrowRight, CalendarHeart, Check, GraduationCap, HandHeart, HeartHandshake, QrCode, Search, ShieldCheck, Sprout, Users } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Avatar, Button, ProgressBar } from '../components/ui';
import { useStore } from '../lib/store';

function PreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-sage-200/60 via-olive-100/40 to-clay-100/60 blur-2xl" />
      <div className="animate-fade-up rounded-3xl border border-line bg-paper p-6 shadow-[0_30px_60px_-30px_rgba(58,74,53,.45)]" style={{ animationDelay: '120ms' }}>
        <div className="flex items-center justify-between">
          <p className="label-mono">Companion Commitment</p>
          <span className="rounded-full bg-sage-100 px-2.5 py-0.5 font-mono text-[11px] text-sage-800">Active</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Avatar size={48} />
          <div>
            <p className="font-mono text-[17px] font-semibold">Margaret</p>
            <p className="text-[13px] text-muted">Maple Grove Residence · Week 6</p>
          </div>
        </div>
        <div className="mt-5 flex items-baseline justify-between">
          <p className="text-[13px] text-ink-soft">This week</p>
          <p className="font-mono text-[13px] font-medium">1 of 2 Visits</p>
        </div>
        <ProgressBar value={50} className="mt-2" size="lg" label="Weekly progress" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-cream p-3">
            <p className="label-mono">Next Visit</p>
            <p className="mt-1 font-mono text-[13px] font-medium">Wed · 2:00 PM</p>
          </div>
          <div className="rounded-2xl bg-cream p-3">
            <p className="label-mono">Approved</p>
            <p className="mt-1 font-mono text-[13px] font-medium">11 hrs</p>
          </div>
        </div>
      </div>
      <div className="absolute -left-6 top-24 hidden animate-fade-up rounded-2xl border border-line bg-paper px-3.5 py-2.5 shadow-lg sm:block" style={{ animationDelay: '300ms' }}>
        <p className="flex items-center gap-2 font-mono text-[12px]"><Sprout className="h-4 w-4 text-sage-600" />Both love gardening</p>
      </div>
      <div className="absolute -right-5 bottom-16 hidden animate-fade-up rounded-2xl border border-line bg-paper px-3.5 py-2.5 shadow-lg sm:block" style={{ animationDelay: '420ms' }}>
        <p className="flex items-center gap-2 font-mono text-[12px]"><span className="font-semibold text-sage-700">92%</span> Compatibility</p>
      </div>
    </div>
  );
}

const STEPS = [
  { icon: <ShieldCheck className="h-5 w-5" />, title: 'Get Ready', body: 'Students submit a Vulnerable Sector Check, complete orientation, and share their interests and availability.' },
  { icon: <Search className="h-5 w-5" />, title: 'Find Your Companion', body: 'Our compatibility score suggests residents you’re likely to connect with. Families review and accept each request.' },
  { icon: <CalendarHeart className="h-5 w-5" />, title: 'Keep Showing Up', body: 'Schedule regular visits, check in at the front desk, and build a relationship that grows week after week.' },
];

export default function Landing() {
  const { user } = useStore();
  const dash = user?.role ? (user.onboarded ? (user.role === 'family' ? '/family' : '/student') : `/onboarding/${user.role}`) : user ? '/welcome' : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo to="/about" />
        <nav className="flex items-center gap-2">
          <a href="#how" className="hidden rounded-lg px-3 py-2 font-mono text-[13px] text-ink-soft hover:text-ink md:block">How It Works</a>
          <a href="#commitment" className="hidden rounded-lg px-3 py-2 font-mono text-[13px] text-ink-soft hover:text-ink md:block">Companion Commitment</a>
          {dash ? <Button to={dash} size="sm">Open Dashboard</Button> : (
            <>
              <Button to="/signin" variant="ghost" size="sm">Sign In</Button>
              <Button to="/register" size="sm">Get Started</Button>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div className="animate-fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-sage-200 bg-paper px-3 py-1 font-mono text-[12px] text-sage-700">
            <HeartHandshake className="h-3.5 w-3.5" /> Intergenerational Companionship
          </p>
          <h1 className="text-[40px] font-semibold leading-[1.08] sm:text-[54px]">
            Meaningful Connections.<br /><span className="text-sage-600">Familiar Faces.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            FamiliarFaces pairs university students with older adults in care homes, including people living with dementia, for
            regular, long-term visits. Not a different volunteer every week. The same friendly face, every week.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={dash ?? '/register'} size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>{dash ? 'Open Dashboard' : 'Get Started'}</Button>
            {!dash && <Button to="/signin" size="lg" variant="secondary">Sign In</Button>}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
            {['Thoughtful Matching', 'Family-Approved Companions', 'Verified Volunteer Hours'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-sage-600" />{t}</span>
            ))}
          </div>
        </div>
        <PreviewCard />
      </section>

      {/* Mission */}
      <section className="border-y border-line/70 bg-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="label-mono mb-3">Our Mission</p>
            <h2 className="text-[28px] font-semibold">Loneliness is quiet. Connection doesn't have to be.</h2>
          </div>
          <div className="space-y-4 text-[16px] leading-relaxed text-ink-soft">
            <p>Many older adults in care homes go days without a meaningful conversation. For people living with dementia, a constantly changing set of visitors can feel unsettling rather than comforting.</p>
            <p>We believe familiarity is a form of care. FamiliarFaces helps students and residents build genuine friendships through consistent visits, reducing loneliness, bridging generations, and giving students a volunteer experience that truly matters.</p>
          </div>
        </div>
      </section>

      {/* Companion Commitment */}
      <section id="commitment" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-mono mb-3">Our Core Idea</p>
          <h2 className="text-[30px] font-semibold">Companion Commitment</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
            Each student is matched with one compatible resident and commits to a regular weekly visit goal. Progress is tracked
            together, so consistency, not just total hours, is what gets celebrated.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-line bg-paper/60 p-7">
            <p className="label-mono mb-4">Traditional Volunteering</p>
            <ul className="space-y-3 text-[14.5px] text-ink-soft">
              {['Different residents each shift', 'Conversations restart from zero', 'Hours logged without context', 'Hard for families to know who is visiting'].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted/60" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-sage-300 bg-gradient-to-br from-sage-700 to-sage-800 p-7 text-cream shadow-[0_30px_60px_-30px_rgba(58,74,53,.8)]">
            <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-sage-200">With FamiliarFaces</p>
            <ul className="space-y-3 text-[14.5px] text-cream/90">
              {['One consistent, compatible companion', 'Relationships that deepen over months', 'Weekly visit goals with gentle progress tracking', 'Families approve every visit and every hour'].map((t) => (
                <li key={t} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-8 bg-sand/50">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mb-12 text-center">
            <p className="label-mono mb-3">How It Works</p>
            <h2 className="text-[30px] font-semibold">Three simple steps</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="group rounded-3xl border border-line bg-paper p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(58,74,53,.4)]">
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-100 text-sage-700 transition group-hover:bg-sage-700 group-hover:text-cream">{s.icon}</div>
                  <span className="font-mono text-[32px] font-semibold text-sand">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-[17px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            { icon: <GraduationCap className="h-5 w-5" />, title: 'For Students', points: ['A volunteer role built around real relationships', 'Flexible scheduling that fits your timetable', 'Family-approved volunteer hours for your records', 'Orientation on dementia awareness and communication'] },
            { icon: <Users className="h-5 w-5" />, title: 'For Families', points: ['Choose a companion who fits your loved one', 'See upcoming and completed visits at a glance', 'Review and approve every visit’s hours', 'Share preferences, routines, and topics to avoid'] },
          ].map((b) => (
            <div key={b.title} className="rounded-3xl border border-line bg-paper p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-olive-100 text-olive-700">{b.icon}</div>
                <h3 className="text-[19px] font-semibold">{b.title}</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {b.points.map((p) => <li key={p} className="flex gap-3 text-[14.5px] text-ink-soft"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {[
            { icon: <ShieldCheck className="h-4 w-4" />, t: 'Vulnerable Sector Check required for every student' },
            { icon: <HandHeart className="h-4 w-4" />, t: 'Companions, not caregivers, care-home rules come first' },
            { icon: <QrCode className="h-4 w-4" />, t: 'Front-desk check-in records every visit' },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3 rounded-2xl border border-line/80 bg-paper/60 px-4 py-3.5 text-[13.5px] text-ink-soft">
              <span className="text-sage-600">{x.icon}</span>{x.t}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-sage-800 px-8 py-14 text-center sm:px-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sage-600/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-olive-500/30 blur-3xl" />
          <h2 className="relative text-[28px] font-semibold text-cream sm:text-[34px]">Become someone's familiar face.</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-[15.5px] text-cream/75">Join as a student volunteer or create a profile for a loved one in care.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button to={dash ?? '/register'} size="lg" className="!bg-cream !text-sage-800 hover:!bg-white" iconRight={<ArrowRight className="h-4 w-4" />}>{dash ? 'Open Dashboard' : 'Get Started'}</Button>
            {!dash && <Button to="/signin" size="lg" variant="ghost" className="!text-cream hover:!bg-sage-700">Sign In</Button>}
          </div>
        </div>
      </section>

      <footer className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-[12.5px] text-muted sm:flex-row sm:px-8">
          <Logo to="/about" />
          <p>Built for NatHacks 2026 · All names and profiles shown are fictional.</p>
        </div>
      </footer>
    </div>
  );
}
