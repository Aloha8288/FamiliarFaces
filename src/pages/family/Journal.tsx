import { BookHeart } from 'lucide-react';
import { useStore, useFamilyView } from '../../lib/store';
import { Button, Card, EmptyState, PageHeader } from '../../components/ui';
import { JournalEntryCard } from '../../components/journal';
import { residentFirst } from '../../components/domain';

export default function FamilyJournal() {
  const { data } = useStore();
  const fv = useFamilyView();
  const r = fv.resident!;
  const name = residentFirst(r);
  const entries = data.journal.filter((j) => j.residentId === r.id);
  const student = fv.student;

  return (
    <div>
      <PageHeader eyebrow="Journal" title={`${name}'s Journal`}
        subtitle={student ? `What ${student.fullName.split(' ')[0]} and ${name} talked about, and what ${name} enjoyed.` : `Notes from ${name}'s companion will appear here.`} />
      <div className="max-w-3xl space-y-3">
        {entries.length ? entries.map((e) => {
          const s = data.students[e.studentId];
          return <JournalEntryCard key={e.id} entry={e} author={s?.fullName ?? 'Companion'} authorPhoto={s?.photo} />;
        }) : (
          <Card><EmptyState icon={<BookHeart className="h-5 w-5" />} title="No Entries Yet"
            body={student ? `After each visit, ${student.fullName.split(' ')[0]} can share notes here.` : `Once ${name} has a companion, their visit notes will appear here.`}
            action={!student ? <Button size="sm" to="/family/find">Find a Volunteer</Button> : undefined} /></Card>
        )}
      </div>
    </div>
  );
}
