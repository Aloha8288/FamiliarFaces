import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ScrollText } from 'lucide-react';
import { OnboardingLayout, Section } from '../../components/OnboardingLayout';
import { Button, Checkbox, useToast } from '../../components/ui';
import { TermsLink } from '../../components/Terms';
import { availabilityValid, hasAnyAvailability } from '../../components/AvailabilityEditor';
import { useStore } from '../../lib/store';
import { blankStudent } from '../../lib/seed';
import type { StudentProfile } from '../../lib/types';
import { AvailabilitySection, InterestsSection, PersonalSection, VerificationStep, interestsErrors, personalErrors } from './sections';

const STEPS = ['Volunteer Verification', 'Personal Information', 'Interests & Languages', 'Availability', 'Terms & Conditions'];
const TITLES = [
  ['Volunteer Verification', 'Two quick requirements to help keep residents safe.'],
  ['Tell Us About Yourself', 'Families will see your name, school, and program.'],
  ['What Makes You, You', 'Your interests, personality, and languages power your compatibility score.'],
  ['When Can You Visit?', 'We\'ll use this to suggest compatible residents and visit times.'],
  ['Terms & Conditions', 'One last step before your dashboard.'],
];

export default function StudentOnboarding() {
  const { user, data, saveStudent, completeOnboarding } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const p: StudentProfile = (user && data.students[user.id]) || blankStudent(user!.id, user!.email);
  const [step, setStep] = useState(Math.min(p.step || 0, STEPS.length - 1));
  const [showErrors, setShowErrors] = useState(false);
  const [agreed, setAgreed] = useState(!!p.termsAcceptedAt);

  const set = (patch: Partial<StudentProfile>) => saveStudent(patch);

  const stepError = (): string | null => {
    if (step === 0) {
      if (!p.vscFileName) return 'Please select your Vulnerable Sector Check document.';
      if (!p.vscSubmittedAt) return 'Please submit your selected document.';
      if (!p.trainingCompletedAt) return 'Please complete the orientation training.';
    }
    if (step === 1) { const e = personalErrors(p); const k = Object.keys(e); if (k.length) return e[k[0]]; }
    if (step === 2) { const e = interestsErrors(p); const k = Object.keys(e); if (k.length) return e[k[0]]; }
    if (step === 3) {
      if (!hasAnyAvailability(p.availability)) return 'Please add at least one available day and time.';
      if (!availabilityValid(p.availability)) return 'Please fix time windows where the end is before the start.';
    }
    if (step === 4 && !agreed) return 'Please agree to the Terms & Conditions to continue.';
    return null;
  };
  const err = stepError();

  const next = () => {
    if (err) { setShowErrors(true); toast(err, 'error'); return; }
    setShowErrors(false);
    if (step === STEPS.length - 1) {
      saveStudent({ termsAcceptedAt: new Date().toISOString(), step: STEPS.length });
      completeOnboarding();
      toast('Welcome to FamiliarFaces! Your profile is ready.');
      navigate('/student');
      return;
    }
    saveStudent({ step: step + 1 });
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => { setShowErrors(false); setStep(Math.max(0, step - 1)); window.scrollTo({ top: 0 }); };

  return (
    <OnboardingLayout
      steps={STEPS} current={step} title={TITLES[step][0]} subtitle={TITLES[step][1]}
      footer={
        <>
          <Button variant="ghost" onClick={back} disabled={step === 0} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
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
      {step === 0 && <VerificationStep p={p} set={set} />}
      {step === 1 && <PersonalSection p={p} set={set} showErrors={showErrors} />}
      {step === 2 && <InterestsSection p={p} set={set} showErrors={showErrors} />}
      {step === 3 && <AvailabilitySection p={p} set={set} />}
      {step === 4 && (
        <Section title="Terms & Conditions" icon={<ScrollText className="h-4 w-4" />}>
          <div className="rounded-2xl border border-sage-200 bg-sage-50 p-4">
            <Checkbox checked={agreed} onChange={setAgreed}>I Have Read and Agree to the <TermsLink />.</Checkbox>
          </div>
        </Section>
      )}
    </OnboardingLayout>
  );
}
