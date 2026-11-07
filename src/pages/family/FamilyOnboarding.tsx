import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ScrollText } from 'lucide-react';
import { OnboardingLayout, Section } from '../../components/OnboardingLayout';
import { Button, Checkbox, useToast } from '../../components/ui';
import { TermsLink } from '../../components/Terms';
import { availabilityValid } from '../../components/AvailabilityEditor';
import { useStore } from '../../lib/store';
import type { Resident } from '../../lib/types';
import {
  BasicInfoSection, CommunicationSection, DetailsSection, FamilyContactSection, InterestsPrefsSection, TopicsSection,
  basicErrors, familyErrors, prefsErrors,
} from './sections';

const STEPS = ['Your Details', 'Loved One', 'Interests & Companion', 'Communication & Visits', 'Topics & Terms'];
const TITLES = [
  ['Welcome to FamiliarFaces', "Let's start with how a companion can reach you."],
  ['About Your Loved One', 'The basics, so students can get to know them.'],
  ['Interests & Ideal Companion', 'What they love, and who they would enjoy spending time with.'],
  ['Communication & Visits', 'How to connect, and when they enjoy visitors.'],
  ['Topics to Avoid & Terms', 'Almost done.'],
];

export default function FamilyOnboarding() {
  const { user, data, saveResident, completeOnboarding } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const r = data.residents.find((x) => x.familyUserId === user?.id);
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [agreed, setAgreed] = useState(false);

  if (!r) return null;
  const set = (patch: Partial<Resident>) => saveResident({ ...r, ...patch });

  const firstError = (e: Record<string, string>) => Object.values(e)[0] ?? null;
  const err =
    step === 0 ? firstError(familyErrors(r))
    : step === 1 ? firstError(basicErrors(r))
    : step === 2 ? firstError(prefsErrors(r))
    : step === 3 && !availabilityValid(r.availability) ? 'Please fix time windows where the end is before the start.'
    : step === 4 && !agreed ? 'Please agree to the Terms & Conditions to continue.'
    : null;

  const next = () => {
    if (err) { setShowErrors(true); toast(err, 'error'); return; }
    setShowErrors(false);
    if (step === STEPS.length - 1) {
      completeOnboarding();
      toast(`${r.preferredName || r.fullName.split(' ')[0]}'s profile is ready.`);
      navigate('/family');
      return;
    }
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <OnboardingLayout
      steps={STEPS} current={step} title={TITLES[step][0]} subtitle={TITLES[step][1]}
      footer={
        <>
          <Button variant="ghost" onClick={() => { setShowErrors(false); setStep(Math.max(0, step - 1)); }} disabled={step === 0} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
          <div className="flex items-center gap-3">
            {showErrors && err && <span className="hidden text-[13px] text-rose-deep sm:inline">{err}</span>}
            <Button onClick={next} className={err ? 'opacity-60' : ''}
              iconRight={step === STEPS.length - 1 ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}>
              {step === STEPS.length - 1 ? 'Finish & Go to Dashboard' : 'Continue'}
            </Button>
          </div>
        </>
      }
    >
      {step === 0 && <FamilyContactSection r={r} set={set} showErrors={showErrors} />}
      {step === 1 && <BasicInfoSection r={r} set={set} showErrors={showErrors} />}
      {step === 2 && <InterestsPrefsSection r={r} set={set} showErrors={showErrors} />}
      {step === 3 && <><CommunicationSection r={r} set={set} /><DetailsSection r={r} set={set} /></>}
      {step === 4 && (
        <>
          <TopicsSection r={r} set={set} />
          <Section title="Terms & Conditions" icon={<ScrollText className="h-4 w-4" />}>
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-4">
              <Checkbox checked={agreed} onChange={setAgreed}>I Have Read and Agree to the <TermsLink />.</Checkbox>
            </div>
          </Section>
        </>
      )}
    </OnboardingLayout>
  );
}
