import { useState } from 'react';
import { BookHeart, PenLine, Search } from 'lucide-react';
import { useStore, useStudentView } from '../../lib/store';
import type { Mood } from '../../lib/types';
import { Button, Card, CardHeader, EmptyState, PageHeader, useToast } from '../../components/ui';
import { JournalEntryCard, JournalFields } from '../../components/journal';
import { residentFirst } from '../../components/domain';

export default function StudentJournal() {
  const { data, addJournalEntry, deleteJournalEntry } = useStore();
  const sv = useStudentView();
  const toast = useToast();
  const [draft, setDraft] = useState<{ talkedAbout: string; enjoyed: string; mood: Mood | null }>({ talkedAbout: '', enjoyed: '', mood: null });

  if (!sv.commitment || !sv.resident) {
    return (
      <div>
        <PageHeader eyebrow="Journal" title="Companion Journal" />
        <Card><EmptyState icon={<BookHeart className="h-5 w-5" />} title="Your Journal Starts With a Match" body="Once you're matched, keep notes on what you talk about and what your companion enjoys. Their family can read along." action={<Button to="/student/find" icon={<Search className="h-4 w-4" />}>Find a Companion</Button>} /></Card>
      </div>
    );
  }

  const r = sv.resident;
  const name = residentFirst(r);
  const entries = data.journal.filter((j) => j.studentId === sv.profile?.userId && j.residentId === r.id);

  const save = () => {
    const res = addJournalEntry(draft);
    if (!res.ok) return toast(res.error, 'error');
    setDraft({ talkedAbout: '', enjoyed: '', mood: null });
    toast(`Saved. ${r.family.name.split(' ')[0] || 'The family'} can now read it.`);
  };

  return (
    <div>
      <PageHeader eyebrow="Journal" title={`Journal With ${name}`} subtitle={`Notes on your time together. ${r.family.name ? r.family.name.split(' ')[0] : `${name}'s family`} can read every entry.`} />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="lg:sticky lg:top-24">
          <CardHeader title="New Entry" icon={<PenLine className="h-4 w-4" />} />
          <div className="p-5 sm:p-6">
            <JournalFields name={name} {...draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
            <Button className="mt-5 w-full" onClick={save} disabled={!draft.talkedAbout.trim() && !draft.enjoyed.trim()}>Save Entry</Button>
          </div>
        </Card>
        <div className="space-y-3">
          {entries.length ? entries.map((e) => (
            <JournalEntryCard key={e.id} entry={e} author={sv.profile?.fullName ?? 'You'} authorPhoto={sv.profile?.photo} onDelete={() => { deleteJournalEntry(e.id); toast('Entry deleted.', 'info'); }} />
          )) : (
            <Card><EmptyState icon={<BookHeart className="h-5 w-5" />} title="No Entries Yet" body={`After a visit, jot down what you and ${name} talked about and what they enjoyed. You can also do it when you check out.`} /></Card>
          )}
        </div>
      </div>
    </div>
  );
}
