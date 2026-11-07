import { useState } from 'react';
import { CheckCircle2, MessageSquarePlus, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Visit } from '../../lib/types';
import { useStore } from '../../lib/store';
import { fmtDuration, fmtHours } from '../../lib/time';
import { Button, Field, Modal, Textarea, useToast } from '../../components/ui';
import { VisitRow } from '../../components/domain';

/** A completed visit with Approve / Dispute / Add Note actions for families. */
export function ApprovalRow({ v, studentName }: { v: Visit; studentName: string }) {
  const { reviewVisit, setVisitNote } = useStore();
  const toast = useToast();
  const [mode, setMode] = useState<null | 'dispute' | 'note'>(null);
  const [note, setNote] = useState(v.familyNote);

  const approve = () => { reviewVisit(v.id, 'approved'); toast(`Approved ${fmtHours(v.minutes)} for ${studentName}.`); };
  const submitModal = () => {
    if (mode === 'dispute') {
      if (!note.trim()) return;
      reviewVisit(v.id, 'disputed', note);
      toast('Hours disputed. They will not count toward approved hours.', 'info');
    } else {
      setVisitNote(v.id, note);
      toast('Note saved.');
    }
    setMode(null);
  };

  return (
    <VisitRow v={v} title={`${studentName} · ${fmtDuration(v.minutes)}`}
      actions={v.approval === 'pending' ? (
        <>
          <Button size="sm" onClick={approve} icon={<ThumbsUp className="h-3.5 w-3.5" />}>Approve Hours</Button>
          <Button size="sm" variant="danger" onClick={() => { setNote(v.familyNote); setMode('dispute'); }} icon={<ThumbsDown className="h-3.5 w-3.5" />}>Dispute</Button>
        </>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => reviewVisit(v.id, 'pending')}>Change Decision</Button>
      )}>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-2 border-t border-line/60 pt-3 text-[13px]">
        <div className="space-y-1">
          {v.studentNote && <p className="text-ink-soft"><span className="font-medium text-ink">{studentName.split(' ')[0]}'s note:</span> {v.studentNote}</p>}
          {v.familyNote ? <p className="text-ink-soft"><span className="font-medium text-ink">Your note:</span> {v.familyNote}</p> : !v.studentNote && <p className="text-muted">No notes yet.</p>}
        </div>
        <Button size="sm" variant="ghost" icon={<MessageSquarePlus className="h-3.5 w-3.5" />} onClick={() => { setNote(v.familyNote); setMode('note'); }}>{v.familyNote ? 'Edit Note' : 'Add a Note'}</Button>
      </div>

      <Modal open={!!mode} onClose={() => setMode(null)} title={mode === 'dispute' ? 'Dispute These Hours' : 'Add a Note'}
        footer={<><Button variant="ghost" onClick={() => setMode(null)}>Cancel</Button>
          <Button variant={mode === 'dispute' ? 'danger' : 'primary'} onClick={submitModal} disabled={mode === 'dispute' && !note.trim()} icon={mode === 'dispute' ? <ThumbsDown className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}>
            {mode === 'dispute' ? 'Dispute Hours' : 'Save Note'}
          </Button></>}>
        {mode === 'dispute' && <p className="mb-4 text-[14px] text-ink-soft">Disputed hours stay unapproved. Please let {studentName.split(' ')[0]} know what doesn't look right, for example, if the visit was shorter than recorded.</p>}
        <Field label={mode === 'dispute' ? 'Reason for Dispute' : 'Note'} htmlFor="fnote" required={mode === 'dispute'}>
          <Textarea id="fnote" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder={mode === 'dispute' ? 'Staff mentioned the visit ended around 2:30…' : 'Mom loved hearing about your classes!'} />
        </Field>
      </Modal>
    </VisitRow>
  );
}
