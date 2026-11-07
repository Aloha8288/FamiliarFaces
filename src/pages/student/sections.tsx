import { useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, CalendarDays, CheckCircle2, FileText, Flag, Heart, Languages,
  Loader2, Lock, MessageCircle, Shield, Star, Upload, UserRound, Hand, RefreshCw,
} from 'lucide-react';
import type { Fluency, StudentProfile } from '../../lib/types';
import {
  FLUENCY_LEVELS, INTERESTS, LANGUAGES, STUDENT_PERSONALITY, YEARS_OF_STUDY, DURATIONS,
} from '../../lib/options';
import { calculateAge } from '../../lib/time';
import { EMAIL_RE } from '../../lib/store';
import { Section } from '../../components/OnboardingLayout';
import { AvailabilityEditor } from '../../components/AvailabilityEditor';
import { Badge, Button, Chip, ChipGroup, Field, Input, Notice, PhotoUpload, Select, TagInput, cx } from '../../components/ui';

type P = StudentProfile;
type SetP = (patch: Partial<P>) => void;

/* ---------- Validation ---------- */
export function personalErrors(p: P) {
  const e: Record<string, string> = {};
  if (!p.fullName.trim()) e.fullName = 'Please enter your full name.';
  if (!EMAIL_RE.test(p.email.trim())) e.email = 'Please enter a valid email address.';
  if (p.phone.replace(/\D/g, '').length < 10) e.phone = 'Please enter a 10-digit phone number.';
  const age = calculateAge(p.dob);
  if (!p.dob) e.dob = 'Please enter your date of birth.';
  else if (age === null) e.dob = 'Please enter a valid date of birth.';
  else if (age < 18) e.dob = `You must be 18 or older to volunteer. Based on your birth date, you are ${age}.`;
  else if (age > 110) e.dob = 'Please double-check your date of birth.';
  if (!p.university.trim()) e.university = 'Please enter your university or college.';
  if (!p.program.trim()) e.program = 'Please enter your program or major.';
  if (!p.yearOfStudy) e.yearOfStudy = 'Please select your year of study.';
  return e;
}

export function interestsErrors(p: P) {
  const e: Record<string, string> = {};
  if (p.interests.filter((i) => i !== 'Other').length + p.customInterests.length === 0) e.interests = 'Choose at least one interest.';
  if (p.personality.length === 0) e.personality = 'Choose at least one trait that describes you.';
  if (p.languages.length === 0) e.languages = 'Add at least one language you speak.';
  if (p.languages.some((l) => l.language === 'Other') && !p.otherLanguage.trim()) e.languages = 'Please name your other language.';
  return e;
}

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

/* ---------- Step 1: Verification ---------- */
const TRAINING = [
  { icon: Brain, title: 'Dementia Awareness', body: 'Dementia affects memory, language, and perception differently for each person. Someone may repeat a story, forget your name, or be confused about time. That\'s okay, respond with warmth rather than correction.', tip: 'If they don\'t remember you, simply re-introduce yourself with a smile: "Hi Margaret, I\'m Alex, I come by on Wednesdays."' },
  { icon: MessageCircle, title: 'Respectful Communication', body: 'Speak slowly and clearly, face the person, and ask one question at a time. Give extra time to respond, and use their preferred name. Never use baby talk or speak about them as if they aren\'t there.', tip: 'Try open, gentle prompts: "Tell me about your garden" works better than "Do you remember…?"' },
  { icon: Lock, title: 'Privacy', body: 'What you learn during visits, health details, family matters, personal stories, stays private. Do not take photos or post about residents online, even without names.', tip: 'If you want to share a meaningful moment, talk with the family first.' },
  { icon: Hand, title: 'Volunteer Boundaries', body: 'You are a companion, not a caregiver. Don\'t give medication, food outside care-home guidelines, money, or gifts of value. Keep contact within scheduled visits.', tip: 'When unsure whether something is appropriate, ask care-home staff.' },
  { icon: Shield, title: 'Safety', body: 'Never help someone stand, transfer, or walk unsupervised, staff are trained for this. Wash your hands on arrival, stay home if you\'re unwell, and follow posted infection-control rules.', tip: 'If a resident wants to go for a walk, ask staff to accompany you.' },
  { icon: Flag, title: 'Reporting Concerns', body: 'If you notice injury, distress, signs of neglect, or a change in behaviour, tell care-home staff right away. Then submit a report through FamiliarFaces Support so the family is informed.', tip: 'In an emergency, alert staff immediately, don\'t wait to file a report.' },
];

export function VerificationStep({ p, set }: { p: P; set: SetP }) {
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState(0);
  const [viewed, setViewed] = useState<Set<number>>(() => new Set(p.trainingCompletedAt ? TRAINING.map((_, i) => i) : [0]));

  const pick = (f: File | undefined) => {
    if (!f) return;
    const ok = /\.(pdf|jpe?g|png)$/i.test(f.name) && ['application/pdf', 'image/jpeg', 'image/png', ''].includes(f.type);
    if (!ok) return setErr('Please choose a PDF, JPG, or PNG file.');
    if (f.size > 10 * 1024 * 1024) return setErr('Please choose a file smaller than 10 MB.');
    setErr('');
    setFile(f);
    set({ vscFileName: f.name, vscSubmittedAt: null });
  };

  const submit = () => {
    if (!p.vscFileName) return;
    setSubmitting(true);
    // Simulated submission — the document is never uploaded or stored.
    setTimeout(() => {
      setSubmitting(false);
      setFile(null);
      set({ vscSubmittedAt: new Date().toISOString() });
    }, 1100);
  };

  const goCard = (i: number) => { setCard(i); setViewed((v) => new Set(v).add(i)); };
  const T = TRAINING[card];
  const allViewed = viewed.size === TRAINING.length;

  return (
    <>
      <Section title="Vulnerable Sector Check (VSC)" icon={<FileText className="h-4 w-4" />}
        description="Required before you can be matched. Upload a copy of your VSC from your local police service.">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
          className={cx('rounded-2xl border-2 border-dashed p-6 text-center transition',
            p.vscSubmittedAt ? 'border-sage-300 bg-sage-50' : p.vscFileName ? 'border-sage-300 bg-paper' : 'border-line bg-cream/50 hover:border-sage-300')}
        >
          {p.vscSubmittedAt ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-9 w-9 text-sage-600" />
              <p className="mt-2 font-mono text-[15px] font-semibold text-sage-800">Document Submitted</p>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-soft"><FileText className="h-3.5 w-3.5" />{p.vscFileName}</p>
              <Badge tone="olive" className="mt-3">Awaiting Review · Not Yet Verified</Badge>
              <Button size="sm" variant="ghost" className="mt-3" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => ref.current?.click()}>Replace File</Button>
            </div>
          ) : p.vscFileName ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3.5 py-2">
                <FileText className="h-4 w-4 text-sage-600" />
                <span className="max-w-[240px] truncate text-[14px] font-medium">{p.vscFileName}</span>
                {file && <span className="text-[12px] text-muted">{(file.size / 1024).toFixed(0)} KB</span>}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => ref.current?.click()}>Replace File</Button>
                <Button size="sm" onClick={submit} disabled={submitting} icon={submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}>
                  {submitting ? 'Submitting…' : 'Submit Document'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-100 text-sage-700"><Upload className="h-5 w-5" /></div>
              <p className="mt-3 text-[14px] font-medium">Drag your file here, or choose a file</p>
              <p className="mt-0.5 text-[12px] text-muted">PDF, JPG, or PNG · up to 10 MB</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => ref.current?.click()}>Choose File</Button>
            </div>
          )}
          <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden"
            aria-label="Vulnerable Sector Check document" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
        {err && <p className="mt-2 text-[13px] text-rose-deep" role="alert">{err}</p>}
      </Section>

      <Section title="Volunteer Orientation & Safety Training" icon={<BookOpen className="h-4 w-4" />}
        description="Six short lessons, about five minutes. Read each card to complete your orientation.">
        {p.trainingCompletedAt ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-sage-200 bg-sage-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-sage-600" />
              <div>
                <p className="font-mono text-[14px] font-semibold text-sage-800">Orientation Completed</p>
                <p className="text-[12.5px] text-ink-soft">All six lessons reviewed.</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => { set({ trainingCompletedAt: null }); goCard(0); }}>Review Again</Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {TRAINING.map((t, i) => (
                <button key={t.title} type="button" onClick={() => goCard(i)} aria-label={`Lesson ${i + 1}: ${t.title}`}
                  className={cx('h-1.5 flex-1 min-w-8 rounded-full transition', i === card ? 'bg-sage-700' : viewed.has(i) ? 'bg-sage-300' : 'bg-sand')} />
              ))}
            </div>
            <div key={card} className="animate-fade-in rounded-2xl border border-line bg-cream/60 p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-sage-700 text-cream"><T.icon className="h-5 w-5" /></div>
                <div>
                  <p className="label-mono">Lesson {card + 1} of {TRAINING.length}</p>
                  <h3 className="text-[16px] font-semibold">{T.title}</h3>
                </div>
              </div>
              <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">{T.body}</p>
              <div className="mt-4 flex gap-2 rounded-xl bg-paper p-3 text-[13.5px] text-sage-800">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-olive-500" /><span><strong className="font-semibold">Try this:</strong> {T.tip}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" disabled={card === 0} onClick={() => goCard(card - 1)} icon={<ArrowLeft className="h-3.5 w-3.5" />}>Previous</Button>
              {card < TRAINING.length - 1 ? (
                <Button variant="soft" size="sm" onClick={() => goCard(card + 1)} iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Next Lesson</Button>
              ) : (
                <Button size="sm" disabled={!allViewed} onClick={() => set({ trainingCompletedAt: new Date().toISOString() })} icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                  Complete Training
                </Button>
              )}
            </div>
            {card === TRAINING.length - 1 && !allViewed && <p className="mt-2 text-right text-[12px] text-muted">Please view every lesson to complete training.</p>}
          </>
        )}
      </Section>
    </>
  );
}

/* ---------- Step 2: Personal ---------- */
export function PersonalSection({ p, set, showErrors }: { p: P; set: SetP; showErrors: boolean }) {
  const e = showErrors ? personalErrors(p) : {};
  const age = calculateAge(p.dob);
  const maxDob = new Date().toISOString().slice(0, 10);
  return (
    <Section title="Personal Information" icon={<UserRound className="h-4 w-4" />} description="This helps families get to know you.">
      <div className="mb-6"><PhotoUpload value={p.photo} onChange={(photo) => set({ photo })} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" required htmlFor="fullName" error={e.fullName}>
          <Input id="fullName" autoComplete="name" value={p.fullName} onChange={(x) => set({ fullName: x.target.value })} />
        </Field>
        <Field label="Email" required htmlFor="pemail" error={e.email}>
          <Input id="pemail" type="email" autoComplete="email" value={p.email} onChange={(x) => set({ email: x.target.value })} />
        </Field>
        <Field label="Phone Number" required htmlFor="phone" error={e.phone}>
          <Input id="phone" type="tel" autoComplete="tel" placeholder="(780) 555-0123" value={p.phone} onChange={(x) => set({ phone: formatPhone(x.target.value) })} />
        </Field>
        <div className="grid grid-cols-[1fr_96px] gap-3">
          <Field label="Date of Birth" required htmlFor="dob" error={e.dob}>
            <Input id="dob" type="date" max={maxDob} value={p.dob} onChange={(x) => set({ dob: x.target.value })} />
          </Field>
          <Field label="Age" htmlFor="age">
            <div id="age" aria-live="polite" className={cx('field-input flex items-center justify-center font-mono font-semibold', age !== null && age < 18 ? 'text-rose-deep' : 'text-ink')}>
              {age ?? '—'}
            </div>
          </Field>
        </div>
        <Field label="University / College" required htmlFor="uni" error={e.university}>
          <Input id="uni" placeholder="University of Alberta" value={p.university} onChange={(x) => set({ university: x.target.value })} />
        </Field>
        <Field label="Program / Major" required htmlFor="program" error={e.program}>
          <Input id="program" placeholder="e.g. Nursing, Psychology" value={p.program} onChange={(x) => set({ program: x.target.value })} />
        </Field>
        <Field label="Year of Study" required htmlFor="year" error={e.yearOfStudy}>
          <Select id="year" value={p.yearOfStudy} onChange={(x) => set({ yearOfStudy: x.target.value })}>
            <option value="">Select…</option>
            {YEARS_OF_STUDY.map((y) => <option key={y}>{y}</option>)}
          </Select>
        </Field>
      </div>
      {age !== null && age < 18 && (
        <div className="mt-5"><Notice tone="warn" title="Volunteers must be 18 or older">FamiliarFaces visits involve vulnerable adults, so all student volunteers must be at least 18. We'd love to have you join once you turn 18.</Notice></div>
      )}
    </Section>
  );
}

/* ---------- Step 3: Interests, personality, languages ---------- */
export function InterestsSection({ p, set, showErrors }: { p: P; set: SetP; showErrors: boolean }) {
  const e = showErrors ? interestsErrors(p) : {};
  const toggleLang = (lang: string) => {
    if (p.languages.some((l) => l.language === lang)) set({ languages: p.languages.filter((l) => l.language !== lang) });
    else set({ languages: [...p.languages, { language: lang, fluency: 'Conversational' }] });
  };
  const setFluency = (lang: string, fluency: Fluency) =>
    set({ languages: p.languages.map((l) => (l.language === lang ? { ...l, fluency } : l)) });

  return (
    <>
      <Section title="Interests and Hobbies" icon={<Heart className="h-4 w-4" />} description="Pick everything you enjoy, shared interests are the biggest part of your match score.">
        <ChipGroup label="Interests" options={INTERESTS} value={p.interests} onChange={(interests) => set({ interests })} />
        <div className="mt-5">
          <p className="mb-2 text-[13px] font-medium">Add Your Own</p>
          <TagInput value={p.customInterests} onChange={(customInterests) => set({ customInterests })} placeholder="e.g. Birdwatching" />
        </div>
        {e.interests && <p className="mt-3 text-[13px] text-rose-deep">{e.interests}</p>}
      </Section>

      <Section title="Your Personality" icon={<Star className="h-4 w-4" />} description="Families tell us what kind of companion their loved one would enjoy. How would friends describe you?">
        <ChipGroup label="Personality" options={STUDENT_PERSONALITY} value={p.personality} onChange={(personality) => set({ personality })}
          otherValue={p.otherPersonality} onOtherChange={(otherPersonality) => set({ otherPersonality })} />
        {e.personality && <p className="mt-3 text-[13px] text-rose-deep">{e.personality}</p>}
      </Section>

      <Section title="Languages" icon={<Languages className="h-4 w-4" />} description="Select every language you speak and your comfort level.">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => <Chip key={l} selected={p.languages.some((x) => x.language === l)} onClick={() => toggleLang(l)}>{l}</Chip>)}
        </div>
        {p.languages.length > 0 && (
          <div className="mt-5 space-y-2">
            {p.languages.map((l) => (
              <div key={l.language} className="flex flex-col gap-2 rounded-xl border border-line/80 bg-cream/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                {l.language === 'Other' ? (
                  <Input className="sm:max-w-[220px]" placeholder="Which language?" value={p.otherLanguage} onChange={(x) => set({ otherLanguage: x.target.value })} aria-label="Other language" />
                ) : <span className="font-mono text-[13px] font-medium">{l.language}</span>}
                <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={`${l.language} fluency`}>
                  {FLUENCY_LEVELS.map((f) => (
                    <button key={f} type="button" role="radio" aria-checked={l.fluency === f} onClick={() => setFluency(l.language, f)}
                      className={cx('rounded-lg px-2.5 py-1 text-[12px] transition', l.fluency === f ? 'bg-sage-700 text-cream' : 'text-ink-soft hover:bg-sage-50')}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {e.languages && <p className="mt-3 text-[13px] text-rose-deep">{e.languages}</p>}
      </Section>
    </>
  );
}

/* ---------- Step 4: Availability ---------- */
export function AvailabilitySection({ p, set }: { p: P; set: SetP }) {
  return (
    <>
      <Section title="Weekly Availability" icon={<CalendarDays className="h-4 w-4" />} description="Turn on the days you can visit, then choose Morning, Afternoon, Evening, or set custom times. You can add several windows per day.">
        <AvailabilityEditor value={p.availability} onChange={(availability) => set({ availability })} />
      </Section>
      <Section title="Visit Preferences" icon={<Heart className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preferred Visits Per Week" htmlFor="vpw" hint="Your weekly Companion Commitment goal.">
            <Select id="vpw" value={p.visitsPerWeek} onChange={(x) => set({ visitsPerWeek: Number(x.target.value) })}>
              {[1, 2, 3].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Visit' : 'Visits'}</option>)}
            </Select>
          </Field>
          <Field label="Preferred Visit Duration" htmlFor="dur">
            <Select id="dur" value={p.visitDuration} onChange={(x) => set({ visitDuration: Number(x.target.value) })}>
              {DURATIONS.map((d) => <option key={d} value={d}>{d < 60 ? `${d} minutes` : `${d / 60} ${d === 60 ? 'hour' : 'hours'}`}</option>)}
            </Select>
          </Field>
        </div>
      </Section>
    </>
  );
}

