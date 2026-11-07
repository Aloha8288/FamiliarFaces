import { useState } from 'react';
import { Eye, Save, Undo2 } from 'lucide-react';
import { useStore, useFamilyView } from '../../lib/store';
import type { Resident } from '../../lib/types';
import { availabilityValid } from '../../components/AvailabilityEditor';
import { Avatar, Badge, Button, Card, PageHeader, cx, useToast } from '../../components/ui';
import { residentFirst } from '../../components/domain';
import {
  BasicInfoSection, CommunicationSection, DetailsSection, FamilyContactSection, InterestsPrefsSection, TopicsSection,
  basicErrors, familyErrors, prefsErrors,
} from './sections';

const TABS = ['Basics', 'Interests & Companion', 'Communication', 'Visits & Favourites', 'Topics to Avoid', 'Your Contact'] as const;
type Tab = (typeof TABS)[number];

export default function LovedOneProfile() {
  const { saveResident } = useStore();
  const fv = useFamilyView();
  const toast = useToast();
  const [draft, setDraft] = useState<Resident>(fv.resident!);
  const [tab, setTab] = useState<Tab>('Basics');
  const [showErrors, setShowErrors] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(fv.resident);
  const set = (patch: Partial<Resident>) => setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    const checks: [Tab, Record<string, string>][] = [['Basics', basicErrors(draft)], ['Interests & Companion', prefsErrors(draft)], ['Your Contact', familyErrors(draft)]];
    for (const [t, e] of checks) {
      const msg = Object.values(e)[0];
      if (msg) { setShowErrors(true); setTab(t); toast(msg, 'error'); return; }
    }
    if (!availabilityValid(draft.availability)) { setTab('Visits & Favourites'); toast('Please fix time windows where the end is before the start.', 'error'); return; }
    saveResident(draft);
    setShowErrors(false);
    toast(`${residentFirst(draft)}'s profile has been saved.`);
  };

  return (
    <div>
      <PageHeader eyebrow="Loved One's Profile" title={draft.fullName || "Your Loved One"}
        subtitle="The more students know, the better the match. Updates take effect right away."
        action={<>
          {dirty && <Button variant="ghost" icon={<Undo2 className="h-4 w-4" />} onClick={() => { setDraft(fv.resident!); setShowErrors(false); }}>Discard</Button>}
          <Button icon={<Save className="h-4 w-4" />} onClick={save} disabled={!dirty}>Save Changes</Button>
        </>} />

      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar photo={draft.photo} size={64} />
        <div className="flex-1">
          <p className="font-mono text-[16px] font-semibold">{draft.preferredName || draft.fullName}</p>
          <p className="text-[13px] text-muted">{draft.age} · {draft.careHome}</p>
        </div>
        <div className="flex items-center gap-2 text-[12.5px] text-muted">
          <Eye className="h-4 w-4" />Students see interests, personality, and preferences.
          <Badge tone="outline">Private notes stay private</Badge>
        </div>
      </Card>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-paper p-1" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cx('shrink-0 whitespace-nowrap rounded-xl px-4 py-2 font-mono text-[12.5px] transition', tab === t ? 'bg-sage-700 text-cream' : 'text-ink-soft hover:bg-sage-50')}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === 'Basics' && <BasicInfoSection r={draft} set={set} showErrors={showErrors} />}
        {tab === 'Interests & Companion' && <InterestsPrefsSection r={draft} set={set} showErrors={showErrors} />}
        {tab === 'Communication' && <CommunicationSection r={draft} set={set} />}
        {tab === 'Visits & Favourites' && <DetailsSection r={draft} set={set} />}
        {tab === 'Topics to Avoid' && <TopicsSection r={draft} set={set} />}
        {tab === 'Your Contact' && <FamilyContactSection r={draft} set={set} showErrors={showErrors} />}
      </div>

      {dirty && (
        <div className="sticky bottom-4 mt-6 flex animate-fade-up items-center justify-between gap-3 rounded-2xl border border-line bg-paper/95 px-5 py-3 shadow-lg backdrop-blur">
          <p className="text-[13px] text-ink-soft">You have unsaved changes.</p>
          <Button size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={save}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}
