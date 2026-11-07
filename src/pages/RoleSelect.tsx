import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, GraduationCap, Users } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button, cx } from '../components/ui';
import { useStore } from '../lib/store';
import type { Role } from '../lib/types';

const ROLES: { role: Role; icon: typeof Users; title: string; body: string; points: string[] }[] = [
  {
    role: 'student', icon: GraduationCap, title: 'Student Volunteer',
    body: 'I\'m a university or college student who wants to become a consistent companion.',
    points: ['Complete verification & orientation', 'Find a compatible resident', 'Track visits and approved hours'],
  },
  {
    role: 'family', icon: Users, title: 'Family Member / Guardian',
    body: 'I\'d like to create a profile for a loved one living in a care home.',
    points: ['Describe your loved one\'s preferences', 'Review companion requests', 'Approve visits and hours'],
  },
];

export default function RoleSelect() {
  const { setRole, user } = useStore();
  const navigate = useNavigate();
  const [choice, setChoice] = useState<Role | null>(null);

  return (
    <div className="min-h-screen bg-cream px-5 py-6 sm:px-8">
      <Logo />
      <div className="mx-auto max-w-3xl py-14">
        <div className="animate-fade-up text-center">
          <p className="label-mono mb-3">Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}</p>
          <h1 className="text-[30px] font-semibold">How will you use FamiliarFaces?</h1>
          <p className="mt-2 text-[15px] text-ink-soft">Choose the option that fits you best.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2" role="radiogroup" aria-label="Account type">
          {ROLES.map(({ role, icon: Icon, title, body, points }) => {
            const active = choice === role;
            return (
              <button key={role} type="button" role="radio" aria-checked={active} onClick={() => setChoice(role)}
                className={cx('relative rounded-3xl border-2 bg-paper p-7 text-left transition-all duration-200 hover:-translate-y-0.5',
                  active ? 'border-sage-600 shadow-[0_20px_40px_-24px_rgba(58,74,53,.6)]' : 'border-line hover:border-sage-200')}>
                <span className={cx('absolute right-5 top-5 grid h-6 w-6 place-items-center rounded-full border-2 transition', active ? 'border-sage-700 bg-sage-700' : 'border-line')}>
                  {active && <Check className="h-3.5 w-3.5 text-cream" strokeWidth={3} />}
                </span>
                <div className={cx('grid h-12 w-12 place-items-center rounded-2xl transition', active ? 'bg-sage-700 text-cream' : 'bg-sage-100 text-sage-700')}><Icon className="h-6 w-6" /></div>
                <h2 className="mt-5 text-[18px] font-semibold">{title}</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{body}</p>
                <ul className="mt-5 space-y-2">
                  {points.map((p) => <li key={p} className="flex gap-2 text-[13px] text-ink-soft"><Check className="mt-0.5 h-3.5 w-3.5 text-sage-600" />{p}</li>)}
                </ul>
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <Button size="lg" disabled={!choice} iconRight={<ArrowRight className="h-4 w-4" />}
            onClick={() => { if (!choice) return; setRole(choice); navigate(`/onboarding/${choice}`); }}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
