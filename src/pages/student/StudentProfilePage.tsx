import { useState } from 'react';
import { BookOpenCheck, FileCheck2, Save, Undo2 } from 'lucide-react';
import { useStudentView, useStore } from '../../lib/store';
import type { StudentProfile } from '../../lib/types';
import { calculateAge, fmtDate } from '../../lib/time';
import { Avatar, Badge, Button, Card, PageHeader, cx, useToast } from '../../components/ui';
import { availabilityValid, hasAnyAvailability } from '../../components/AvailabilityEditor';
import { AvailabilitySection, InterestsSection, PersonalSection, interestsErrors, personalErrors } from './sections';

const TABS = ['Personal', 'Interests & Languages', 'Availability'] as const;

export default function StudentProfilePage() {
  const { saveStudent } = useStore();
  const { profile } = useStudentView();
  const toast = useToast();
  const [draft, setDraft] = useState<StudentProfile>(profile!);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Personal');
  const [showErrors, setShowErrors] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  const set = (patch: Partial<StudentProfile>) => setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    const errs = { ...personalErrors(draft), ...interestsErrors(draft) };
    if (!hasAnyAvailability(draft.availability)) errs.availability = 'Please add at least one available day.';
    if (!availabilityValid(draft.availability)) errs.availability = 'Please fix time windows where the end is before the start.';
    const first = Object.entries(errs)[0];
    if (first) {
      setShowErrors(true);
      setTab(first[0] in personalErrors(draft) ? 'Personal' : first[0] === 'availability' ? 'Availability' : 'Interests & Languages');
      toast(first[1], 'error');
      return;
    }
    saveStudent(draft);
    setShowErrors(false);
    toast('Profile saved. Your match scores have been updated.');
  };

  const age = calculateAge(draft.dob);

  return (
    <div>
      <PageHeader eyebrow="Profile" title="Your Profile" subtitle="Keep your details current, changes immediately update your compatibility scores."
        action={<>
          {dirty && <Button variant="ghost" icon={<Undo2 className="h-4 w-4" />} onClick={() => { setDraft(profile!); setShowErrors(false); }}>Discard</Button>}
          <Button icon={<Save className="h-4 w-4" />} onClick={save} disabled={!dirty}>Save Changes</Button>
        </>} />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card className="p-6 text-center">
            <Avatar photo={draft.photo} size={88} className="mx-auto" />
            <p className="mt-3 font-mono text-[16px] font-semibold">{draft.fullName || 'Your Name'}</p>
            <p className="text-[13px] text-muted">{draft.program} · {draft.yearOfStudy}</p>
            <p className="text-[13px] text-muted">{draft.university}</p>
            {age !== null && <p className="mt-1 text-[12.5px] text-muted">Age {age}</p>}
          </Card>
          <Card className="space-y-3 p-5">
            <p className="label-mono">Verification</p>
            <div className="flex items-start gap-2.5 text-[13px]">
              <FileCheck2 className="mt-0.5 h-4 w-4 text-olive-500" />
              <div><p className="font-medium">Vulnerable Sector Check</p><p className="text-muted">Document Submitted{profile?.vscSubmittedAt ? ` ${fmtDate(profile.vscSubmittedAt)}` : ''}</p><Badge tone="olive" className="mt-1">Awaiting Review</Badge></div>
            </div>
            <div className="flex items-start gap-2.5 text-[13px]">
              <BookOpenCheck className="mt-0.5 h-4 w-4 text-sage-600" />
              <div><p className="font-medium">Orientation & Safety Training</p><p className="text-muted">{profile?.trainingCompletedAt ? `Completed ${fmtDate(profile.trainingCompletedAt)}` : 'Not completed'}</p></div>
            </div>
          </Card>
        </div>

        <div className="min-w-0">
          <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-paper p-1" role="tablist">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={cx('flex-1 whitespace-nowrap rounded-xl px-4 py-2 font-mono text-[12.5px] transition', tab === t ? 'bg-sage-700 text-cream' : 'text-ink-soft hover:bg-sage-50')}>
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-6">
            {tab === 'Personal' && <PersonalSection p={draft} set={set} showErrors={showErrors} />}
            {tab === 'Interests & Languages' && <InterestsSection p={draft} set={set} showErrors={showErrors} />}
            {tab === 'Availability' && <AvailabilitySection p={draft} set={set} />}
          </div>
          {dirty && (
            <div className="sticky bottom-4 mt-6 flex animate-fade-up items-center justify-between gap-3 rounded-2xl border border-line bg-paper/95 px-5 py-3 shadow-lg backdrop-blur">
              <p className="text-[13px] text-ink-soft">You have unsaved changes.</p>
              <Button size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={save}>Save Changes</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
