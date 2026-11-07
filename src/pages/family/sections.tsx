import { CalendarDays, EyeOff, Heart, HeartHandshake, Home, MessageCircle, Music, Phone, ShieldAlert, Star, Footprints } from 'lucide-react';
import type { Resident } from '../../lib/types';
import {
  CARE_HOMES, COMMUNICATION, COMPANION_TRAITS, DURATIONS, INTERESTS, LANGUAGES, MOBILITY, NO_PREFERENCE, RELATIONSHIPS, TOPICS_TO_AVOID,
} from '../../lib/options';
import { calculateAge } from '../../lib/time';
import { EMAIL_RE } from '../../lib/store';
import { Section } from '../../components/OnboardingLayout';
import { AvailabilityEditor } from '../../components/AvailabilityEditor';
import { ChipGroup, Field, Input, Notice, PhotoUpload, Select, TagInput, Textarea } from '../../components/ui';

type R = Resident;
type SetR = (patch: Partial<R>) => void;
type Props = { r: R; set: SetR; showErrors?: boolean };

export function familyErrors(r: R) {
  const e: Record<string, string> = {};
  if (!r.family.name.trim()) e.familyName = 'Please enter your name.';
  if (!r.family.relationship) e.relationship = 'Please select your relationship.';
  if (!EMAIL_RE.test(r.family.email.trim())) e.familyEmail = 'Please enter a valid email address.';
  if (r.family.phone.replace(/\D/g, '').length < 10) e.familyPhone = 'Please enter a 10-digit phone number.';
  return e;
}

export function basicErrors(r: R) {
  const e: Record<string, string> = {};
  if (!r.fullName.trim()) e.fullName = "Please enter your loved one's full name.";
  if (!r.age || r.age < 40 || r.age > 120) e.age = 'Please enter an age, or a date of birth.';
  if (!r.careHome.trim()) e.careHome = 'Please choose or enter a care home.';
  if (r.languages.length === 0) e.languages = 'Please select at least one language.';
  if (r.languages.includes('Other') && !r.otherLanguage.trim()) e.languages = 'Please name the other language.';
  return e;
}

export function prefsErrors(r: R) {
  const e: Record<string, string> = {};
  if (r.interests.filter((i) => i !== 'Other').length + r.customInterests.length === 0) e.interests = 'Choose at least one interest.';
  if (r.preferredTraits.length === 0) e.traits = 'Choose at least one option, or "No Preference".';
  return e;
}

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export function FamilyContactSection({ r, set, showErrors }: Props) {
  const e = showErrors ? familyErrors(r) : {};
  const setF = (patch: Partial<R['family']>) => set({ family: { ...r.family, ...patch } });
  return (
    <Section title="Family Contact Information" icon={<Phone className="h-4 w-4" />} description="Shared with your loved one's matched companion so they can reach you about visits.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your Full Name" required htmlFor="fname" error={e.familyName}>
          <Input id="fname" autoComplete="name" value={r.family.name} onChange={(x) => setF({ name: x.target.value })} />
        </Field>
        <Field label="Relationship to Resident" required htmlFor="rel" error={e.relationship}>
          <Select id="rel" value={r.family.relationship} onChange={(x) => setF({ relationship: x.target.value })}>
            <option value="">Select…</option>
            {RELATIONSHIPS.map((x) => <option key={x}>{x}</option>)}
          </Select>
        </Field>
        <Field label="Email" required htmlFor="femail" error={e.familyEmail}>
          <Input id="femail" type="email" value={r.family.email} onChange={(x) => setF({ email: x.target.value })} />
        </Field>
        <Field label="Phone Number" required htmlFor="fphone" error={e.familyPhone}>
          <Input id="fphone" type="tel" placeholder="(780) 555-0123" value={r.family.phone} onChange={(x) => setF({ phone: formatPhone(x.target.value) })} />
        </Field>
      </div>
    </Section>
  );
}

export function BasicInfoSection({ r, set, showErrors }: Props) {
  const e = showErrors ? basicErrors(r) : {};
  const knownHome = CARE_HOMES.includes(r.careHome);
  const homeSelect = r.careHome === '' ? '' : knownHome ? r.careHome : '__other';
  return (
    <Section title="Basic Information" icon={<Home className="h-4 w-4" />}>
      <div className="mb-6"><PhotoUpload value={r.photo} onChange={(photo) => set({ photo })} label="Loved One's Photo" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Resident's Full Name" required htmlFor="rname" error={e.fullName}>
          <Input id="rname" value={r.fullName} onChange={(x) => set({ fullName: x.target.value, preferredName: r.preferredName && r.preferredName !== r.fullName.split(' ')[0] ? r.preferredName : x.target.value.split(' ')[0] })} />
        </Field>
        <Field label="Preferred Name" htmlFor="pname" hint="What they like to be called.">
          <Input id="pname" value={r.preferredName} onChange={(x) => set({ preferredName: x.target.value })} />
        </Field>
        <Field label="Date of Birth" htmlFor="rdob" hint="Optional, age is calculated automatically.">
          <Input id="rdob" type="date" max={new Date().toISOString().slice(0, 10)} value={r.dob}
            onChange={(x) => { const a = calculateAge(x.target.value); set({ dob: x.target.value, age: a ?? r.age }); }} />
        </Field>
        <Field label="Age" required htmlFor="rage" error={e.age}>
          <Input id="rage" type="number" min={40} max={120} value={r.age || ''} disabled={!!r.dob && calculateAge(r.dob) !== null}
            onChange={(x) => set({ age: Number(x.target.value) })} />
        </Field>
        <Field label="Care Home" required htmlFor="home" error={e.careHome}>
          <Select id="home" value={homeSelect} onChange={(x) => set({ careHome: x.target.value === '__other' ? ' ' : x.target.value })}>
            <option value="">Select…</option>
            {CARE_HOMES.map((h) => <option key={h}>{h}</option>)}
            <option value="__other">Other Care Home…</option>
          </Select>
        </Field>
        {homeSelect === '__other' ? (
          <Field label="Care Home Name" required htmlFor="homeother">
            <Input id="homeother" value={r.careHome.trim()} onChange={(x) => set({ careHome: x.target.value || ' ' })} placeholder="Name of care home" />
          </Field>
        ) : (
          <Field label="Neighbourhood" htmlFor="hood">
            <Input id="hood" value={r.neighbourhood} onChange={(x) => set({ neighbourhood: x.target.value })} placeholder="e.g. Glenora" />
          </Field>
        )}
        <Field label="A Little About Them" htmlFor="bio" className="sm:col-span-2" hint="Shown to students browsing companions. Avoid medical details.">
          <Textarea id="bio" value={r.bio} onChange={(x) => set({ bio: x.target.value })} placeholder="A retired teacher who loves her garden and big band music…" />
        </Field>
      </div>
      <div className="mt-6">
        <p className="mb-2 text-[13px] font-medium">Languages Spoken <span className="text-clay-500">*</span></p>
        <p className="-mt-1 mb-3 text-[12px] text-muted">Select their most comfortable language first.</p>
        <ChipGroup label="Languages spoken" options={LANGUAGES} value={r.languages} onChange={(languages) => set({ languages })}
          otherValue={r.otherLanguage} onOtherChange={(otherLanguage) => set({ otherLanguage })} otherPlaceholder="Which language?" />
        {e.languages && <p className="mt-2 text-[13px] text-rose-deep">{e.languages}</p>}
      </div>
    </Section>
  );
}

export function InterestsPrefsSection({ r, set, showErrors }: Props) {
  const e = showErrors ? prefsErrors(r) : {};
  return (
    <>
      <Section title="Interests and Hobbies" icon={<Heart className="h-4 w-4" />} description="Select everything your loved one enjoys, now or in the past.">
        <ChipGroup label="Interests" options={INTERESTS} value={r.interests} onChange={(interests) => set({ interests })} />
        <div className="mt-5">
          <p className="mb-2 text-[13px] font-medium">Add Your Own</p>
          <TagInput value={r.customInterests} onChange={(customInterests) => set({ customInterests })} placeholder="e.g. Curling" />
        </div>
        {e.interests && <p className="mt-3 text-[13px] text-rose-deep">{e.interests}</p>}
      </Section>
      <section className="rounded-[var(--radius-card)] border-2 border-sage-300 bg-gradient-to-br from-paper to-sage-50 p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-700 text-cream"><HeartHandshake className="h-4 w-4" /></div>
          <div>
            <h2 className="text-[17px] font-semibold">What Kind of Companion Would Your Loved One Prefer?</h2>
            <p className="mt-0.5 text-[13.5px] text-ink-soft">Select all that apply. This is one of the most important parts of how we suggest companions.</p>
          </div>
        </div>
        <ChipGroup label="Preferred companion personality" options={COMPANION_TRAITS} value={r.preferredTraits}
          onChange={(preferredTraits) => set({ preferredTraits })} exclusive={[NO_PREFERENCE]}
          otherValue={r.otherTrait} onOtherChange={(otherTrait) => set({ otherTrait })} otherPlaceholder="Describe the companion you have in mind" />
        {e.traits && <p className="mt-3 text-[13px] text-rose-deep">{e.traits}</p>}
      </section>
    </>
  );
}

export function CommunicationSection({ r, set }: Props) {
  return (
    <>
      <Section title="Communication Preferences" icon={<MessageCircle className="h-4 w-4" />} description="Help their companion know how to connect.">
        <ChipGroup label="Communication preferences" options={COMMUNICATION} value={r.communication} onChange={(communication) => set({ communication })}
          otherValue={r.otherCommunication} onOtherChange={(otherCommunication) => set({ otherCommunication })} />
        <Field label="How Does Your Loved One Prefer to Be Spoken To?" htmlFor="spoken" className="mt-6">
          <Textarea id="spoken" value={r.spokenTo} onChange={(x) => set({ spokenTo: x.target.value })} placeholder="e.g. Slowly and face-to-face. She loves being called by her first name." />
        </Field>
      </Section>
      <Section title="Mobility and Activities" icon={<Footprints className="h-4 w-4" />}>
        <ChipGroup label="Mobility and activities" options={MOBILITY} value={r.mobility} onChange={(mobility) => set({ mobility })}
          otherValue={r.otherMobility} onOtherChange={(otherMobility) => set({ otherMobility })} />
        <div className="mt-5">
          <Notice title="Companions, Not Caregivers">
            Volunteers follow each care home's safety rules. They do not provide medical care, help with transfers, or offer unsupervised mobility assistance, walks always happen with staff support where required.
          </Notice>
        </div>
      </Section>
    </>
  );
}

export function DetailsSection({ r, set }: Props) {
  return (
    <>
      <Section title="Preferred Days and Times" icon={<CalendarDays className="h-4 w-4" />} description="When does your loved one most enjoy visitors? This helps match schedules.">
        <AvailabilityEditor value={r.availability} onChange={(availability) => set({ availability })} />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Preferred Visit Duration" htmlFor="rdur">
            <Select id="rdur" value={r.visitDuration} onChange={(x) => set({ visitDuration: Number(x.target.value) })}>
              {DURATIONS.map((d) => <option key={d} value={d}>{d < 60 ? `${d} minutes` : `${d / 60} ${d === 60 ? 'hour' : 'hours'}`}</option>)}
            </Select>
          </Field>
        </div>
      </Section>
      <Section title="Favourites" icon={<Music className="h-4 w-4" />} description="Great conversation starters for a new companion.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Favourite Music" htmlFor="fm"><Input id="fm" value={r.favouriteMusic} onChange={(x) => set({ favouriteMusic: x.target.value })} placeholder="Artists, genres, or songs" /></Field>
          <Field label="Favourite Conversation Topics" htmlFor="ft"><Input id="ft" value={r.favouriteTopics} onChange={(x) => set({ favouriteTopics: x.target.value })} placeholder="Places, memories, hobbies" /></Field>
        </div>
      </Section>
    </>
  );
}

export function TopicsSection({ r, set }: Props) {
  return (
    <Section title="Topics to Avoid" icon={<ShieldAlert className="h-4 w-4" />} description="Shared only with your loved one's matched companion, never shown to students who are browsing.">
      <ChipGroup label="Topics to avoid" options={TOPICS_TO_AVOID} value={r.topicsToAvoid} onChange={(topicsToAvoid) => set({ topicsToAvoid })}
        otherValue={r.otherTopic} onOtherChange={(otherTopic) => set({ otherTopic })} otherPlaceholder="Other topic to avoid" />
      <Field label={<span className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-muted" />Private Notes</span>} htmlFor="priv" className="mt-6"
        hint="Visible only to you. Use this for context you'd like to keep for yourself.">
        <Textarea id="priv" value={r.privateNotes} onChange={(x) => set({ privateNotes: x.target.value })} />
      </Field>
      <div className="mt-4 flex items-start gap-2 text-[12.5px] text-muted">
        <Star className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Topics to avoid and medical information are never used to calculate compatibility scores.
      </div>
    </Section>
  );
}
