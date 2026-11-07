import { useState } from 'react';
import { Heart, MessageCircle, PenLine, Trash2 } from 'lucide-react';
import type { JournalEntry, Mood } from '../lib/types';
import { fmtDate, fmtTime } from '../lib/time';
import { Avatar, Badge, Button, Field, Modal, Textarea, cx } from './ui';

export const MOODS: Mood[] = ['Joyful', 'Chatty', 'Calm', 'Tired', 'Unsettled'];

/** Fields for writing an entry. Used on its own and inside check-out. */
export function JournalFields({ name, talkedAbout, enjoyed, mood, onChange, idPrefix = 'j' }: {
  name: string; talkedAbout: string; enjoyed: string; mood: Mood | null;
  onChange: (patch: { talkedAbout?: string; enjoyed?: string; mood?: Mood | null }) => void; idPrefix?: string;
}) {
  return (
    <div className="space-y-4">
      <Field label="What Did You Talk About?" htmlFor={`${idPrefix}-talk`}>
        <Textarea id={`${idPrefix}-talk`} rows={3} value={talkedAbout} onChange={(e) => onChange({ talkedAbout: e.target.value })}
          placeholder={`e.g. ${name} told me about growing up and their first job.`} />
      </Field>
      <Field label={`What Did ${name} Enjoy?`} htmlFor={`${idPrefix}-enjoy`} hint="Likes, favourite songs, stories, or anything worth remembering for next time.">
        <Textarea id={`${idPrefix}-enjoy`} rows={2} value={enjoyed} onChange={(e) => onChange({ enjoyed: e.target.value })}
          placeholder="e.g. Loved listening to old big band songs and sang along." />
      </Field>
      <div>
        <p className="mb-2 text-[13px] font-medium">How Did {name} Seem?</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button key={m} type="button" aria-pressed={mood === m} onClick={() => onChange({ mood: mood === m ? null : m })}
              className={cx('rounded-full border px-3.5 py-1.5 text-[13px] transition', mood === m ? 'border-sage-700 bg-sage-700 text-cream' : 'border-line bg-paper text-ink-soft hover:border-sage-300')}>
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JournalEntryCard({ entry, author, authorPhoto, onDelete }: {
  entry: JournalEntry; author: string; authorPhoto?: string | null; onDelete?: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <article className="rounded-2xl border border-line/80 bg-paper p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar photo={authorPhoto} size={36} />
          <div>
            <p className="text-[14px] font-medium">{author}</p>
            <p className="text-[12px] text-muted">{fmtDate(entry.createdAt, { weekday: 'long' })} · {fmtTime(entry.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {entry.mood && <Badge tone="sage">{entry.mood}</Badge>}
          {onDelete && (
            <button type="button" aria-label="Delete entry" onClick={() => setConfirm(true)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-rose-soft hover:text-rose-deep">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {entry.talkedAbout && (
          <div className="flex gap-2.5">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
            <div><p className="label-mono mb-0.5">We Talked About</p><p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">{entry.talkedAbout}</p></div>
          </div>
        )}
        {entry.enjoyed && (
          <div className="flex gap-2.5">
            <Heart className="mt-0.5 h-4 w-4 shrink-0 text-clay-500" />
            <div><p className="label-mono mb-0.5">They Enjoyed</p><p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">{entry.enjoyed}</p></div>
          </div>
        )}
      </div>
      {onDelete && (
        <Modal open={confirm} onClose={() => setConfirm(false)} title="Delete This Entry?"
          footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Keep</Button><Button variant="danger" onClick={() => { setConfirm(false); onDelete(); }}>Delete</Button></>}>
          <p className="text-[14px] text-ink-soft">The family will no longer see this entry.</p>
        </Modal>
      )}
    </article>
  );
}

export const JournalIcon = PenLine;
