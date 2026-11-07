import { BadgeCheck, CalendarCheck, Eye, Flag, Hand, HeartHandshake, Home, ShieldCheck, Timer } from 'lucide-react';
import type { ReactNode } from 'react';

const SECTIONS: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <HeartHandshake className="h-4 w-4" />, title: 'Respectful Conduct', body: 'Treat residents, families, and care-home staff with kindness, courtesy, and patience at all times. Harassment, discrimination, or disrespectful language of any kind is not tolerated.' },
  { icon: <BadgeCheck className="h-4 w-4" />, title: 'Resident Dignity', body: 'Every resident is an adult with a lifetime of experience. Address them by their preferred name, involve them in choices, and never speak about them as if they are not present.' },
  { icon: <Eye className="h-4 w-4" />, title: 'Privacy and Confidentiality', body: 'Personal, family, and health information shared with you stays private. Do not photograph residents, post about them on social media, or share details with anyone outside FamiliarFaces and the care home.' },
  { icon: <CalendarCheck className="h-4 w-4" />, title: 'Volunteer Attendance', body: 'Consistency is the heart of a Companion Commitment. Arrive on time, give at least 24 hours’ notice when you must cancel, and let the family know if your availability changes.' },
  { icon: <Hand className="h-4 w-4" />, title: 'Appropriate Boundaries', body: 'You are a companion, not a caregiver. Do not provide medical care, give or handle medication, lend or accept money or gifts of value, or arrange contact outside approved visits.' },
  { icon: <ShieldCheck className="h-4 w-4" />, title: 'Safety', body: 'Never assist with transfers, lifting, or unsupervised walks. Ask staff for help with mobility, and stay in approved areas of the care home.' },
  { icon: <Home className="h-4 w-4" />, title: 'Care Home Rules', body: 'Follow each care home’s sign-in procedures, visiting hours, infection-control practices, and staff instructions. Care-home rules always take priority.' },
  { icon: <Flag className="h-4 w-4" />, title: 'Reporting Concerns', body: 'If you notice signs of distress, injury, neglect, or anything that worries you, tell care-home staff immediately, then submit a report through FamiliarFaces Support.' },
  { icon: <Timer className="h-4 w-4" />, title: 'Volunteer Hour Verification', body: 'Visit hours are recorded through check-in and check-out and must be reviewed by the resident’s family before they count as approved. Misreporting hours may result in removal from the program.' },
];

export function TermsContent() {
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-ink-soft">
        These terms help keep FamiliarFaces safe, respectful, and meaningful for everyone. Please read each section carefully.
      </p>
      {SECTIONS.map((s, i) => (
        <div key={s.title} className="flex gap-3 rounded-2xl border border-line/70 bg-cream/50 p-4">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sage-100 text-sage-700">{s.icon}</div>
          <div>
            <h4 className="text-[14px] font-semibold"><span className="mr-2 text-muted">{String(i + 1).padStart(2, '0')}</span>{s.title}</h4>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder link to the full Terms & Conditions (not wired to a real page). */
export function TermsLink({ children = 'Terms & Conditions' }: { children?: ReactNode }) {
  return (
    <a href="#terms" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="font-medium text-sage-700 underline decoration-sage-300 underline-offset-4 hover:decoration-sage-700">
      {children}
    </a>
  );
}
