import { useState, type ReactNode } from 'react';
import { CalendarX, Clock, HelpCircle, LifeBuoy, RotateCcw, Scale, Send, ShieldAlert, UserCog } from 'lucide-react';
import { useStore } from '../lib/store';
import { fmtDateTime } from '../lib/time';
import { Badge, Button, Card, CardHeader, Notice, PageHeader, Textarea, cx, useToast } from '../components/ui';

interface Topic { key: string; label: string; icon: ReactNode; intro: string; faqs: { q: string; a: string }[] }

const TOPICS: Topic[] = [
  {
    key: 'missed', label: 'Missed Visit', icon: <CalendarX className="h-5 w-5" />,
    intro: 'Life happens, what matters is keeping communication open. Here are a few things that usually help:',
    faqs: [
      { q: 'I missed a visit. What should I do?', a: 'Reach out to the family as soon as you can with a short apology, then reschedule from Visits & Hours. A make-up visit in the same week keeps your commitment on track.' },
      { q: 'My companion missed a visit.', a: 'Students sometimes have exams or illness. We recommend a kind check-in first. If visits are missed repeatedly, let us know below and we\'ll follow up.' },
    ],
  },
  {
    key: 'scheduling', label: 'Scheduling Issue', icon: <Clock className="h-5 w-5" />,
    intro: 'Let\'s get your visits lined up. Common questions:',
    faqs: [
      { q: 'How do I change my availability?', a: 'Students can update their weekly availability from Profile → Availability. New suggested times appear in Visits & Hours right away.' },
      { q: 'The care home changed visiting hours.', a: 'Care-home rules always come first. Cancel any affected visits and choose a new time that fits their updated hours.' },
    ],
  },
  {
    key: 'hours', label: 'Volunteer Hour Dispute', icon: <Scale className="h-5 w-5" />,
    intro: 'Hours are approved by families after each visit. If something doesn\'t look right:',
    faqs: [
      { q: 'Why were my hours disputed?', a: 'Families can dispute a visit if the recorded time doesn\'t match what they know. Check the family\'s note on the visit, most disputes are simple misunderstandings.' },
      { q: 'I forgot to check out.', a: 'Check out as soon as you remember and add a note with your actual departure time. The family can then approve the correct hours.' },
    ],
  },
  {
    key: 'account', label: 'Account Assistance', icon: <UserCog className="h-5 w-5" />,
    intro: 'Happy to help with your account.',
    faqs: [
      { q: 'How do I update my profile?', a: 'Students: open Profile from the sidebar. Families: open Loved One\'s Profile. Remember to select Save Changes.' },
      { q: 'How do I sign out?', a: 'Select your name in the top-right corner, then choose Sign Out.' },
    ],
  },
  {
    key: 'general', label: 'General Question', icon: <HelpCircle className="h-5 w-5" />,
    intro: 'Ask us anything. A few popular questions:',
    faqs: [
      { q: 'What is a Companion Commitment?', a: 'It\'s an ongoing match between one student and one resident, with a weekly visit goal. Consistency helps residents, especially those living with dementia, feel safe and familiar.' },
      { q: 'Can volunteers help with care tasks?', a: 'No. Companions offer friendship and shared activities only. Medical care, medication, and mobility help are always handled by care-home staff.' },
    ],
  },
];

export default function Support() {
  const { addTicket, data, user } = useStore();
  const toast = useToast();
  const [topic, setTopic] = useState<Topic>(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [sentRef, setSentRef] = useState<string | null>(null);
  const tickets = data.tickets.filter((t) => t.userId === user?.id);

  const send = () => {
    if (!message.trim()) return;
    const ref = addTicket(topic.label, message);
    setMessage('');
    setSentRef(ref);
    toast(`Request sent. Reference ${ref}.`);
  };

  return (
    <div>
      <PageHeader eyebrow="Support" title="How Can We Help?" subtitle="Find a quick answer or send us a message." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="tablist">
        {TOPICS.map((t) => (
          <button key={t.key} role="tab" aria-selected={topic.key === t.key} onClick={() => { setTopic(t); setSentRef(null); }}
            className={cx('group flex flex-col items-start gap-3 rounded-2xl border bg-paper p-4 text-left transition hover:-translate-y-0.5 hover:border-sage-300 hover:shadow-md',
              topic.key === t.key ? 'border-sage-600 ring-2 ring-sage-100' : 'border-line')}>
            <span className={cx('grid h-10 w-10 place-items-center rounded-xl transition', topic.key === t.key ? 'bg-sage-700 text-cream' : 'bg-sage-50 text-sage-700')}>{t.icon}</span>
            <span className="font-mono text-[13px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title={topic.label} subtitle={topic.intro} icon={<HelpCircle className="h-4 w-4" />} />
            <div className="divide-y divide-line/70">
              {topic.faqs.map((f) => (
                <details key={f.q} className="group px-5 py-4 sm:px-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-medium">
                    {f.q}
                    <span className="text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Contact Support" subtitle={`Topic: ${topic.label}`} icon={<Send className="h-4 w-4" />} />
            <div className="p-5 sm:p-6">
              {sentRef ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-[14px] text-ink-soft">Thanks, your request has been received. Your reference number is <strong className="font-mono text-ink">{sentRef}</strong>.</p>
                  <Button size="sm" variant="secondary" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => setSentRef(null)}>Send Another</Button>
                </div>
              ) : (
                <>
                  <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what's going on…" aria-label="Message" />
                  <Button className="mt-3" onClick={send} disabled={!message.trim()} icon={<Send className="h-4 w-4" />}>Send Message</Button>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Notice tone="warn" title="Concern About a Resident's Safety?">
            Tell care-home staff right away. In an emergency, call 911. Then let us know here so we can follow up with the family.
          </Notice>
          <Card>
            <CardHeader title="Your Requests" icon={<LifeBuoy className="h-4 w-4" />} />
            {tickets.length ? (
              <ul className="divide-y divide-line/70">
                {tickets.map((t) => (
                  <li key={t.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[12.5px] font-medium">{t.reference}</p>
                      <Badge tone="olive">Received</Badge>
                    </div>
                    <p className="mt-0.5 text-[13px] font-medium">{t.category}</p>
                    <p className="line-clamp-2 text-[12.5px] text-muted">{t.message}</p>
                    <p className="mt-1 text-[11.5px] text-muted">{fmtDateTime(t.createdAt)}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="flex items-center gap-2 px-5 py-6 text-[13px] text-muted"><ShieldAlert className="h-4 w-4" />No requests yet.</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}
