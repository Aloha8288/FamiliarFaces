import type { ReactNode } from 'react';
import { Check, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Button, ProgressBar, cx } from './ui';
import { useStore } from '../lib/store';

export function OnboardingLayout({ steps, current, title, subtitle, children, footer }: {
  steps: string[]; current: number; title: string; subtitle?: string; children: ReactNode; footer: ReactNode;
}) {
  const { signOut } = useStore();
  const navigate = useNavigate();
  const pct = Math.round(((current + 1) / steps.length) * 100);
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-line/60 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Logo to="/" />
          <Button variant="ghost" size="sm" icon={<LogOut className="h-4 w-4" />} onClick={() => { signOut(); navigate('/'); }}>Save & Exit</Button>
        </div>
        <div className="mx-auto max-w-5xl px-5 pb-4 sm:px-8">
          <div className="mb-2 flex items-center justify-between font-mono text-[12px] text-muted">
            <span>Step {current + 1} of {steps.length} · {steps[current]}</span>
            <span>{pct}%</span>
          </div>
          <ProgressBar value={pct} size="sm" label="Onboarding progress" />
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[220px_1fr]">
        <ol className="hidden space-y-1 lg:block" aria-label="Steps">
          {steps.map((s, i) => (
            <li key={s} className={cx('flex items-center gap-3 rounded-xl px-3 py-2 font-mono text-[12.5px]', i === current ? 'bg-paper text-ink shadow-sm' : 'text-muted')}>
              <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px]',
                i < current ? 'border-sage-600 bg-sage-600 text-cream' : i === current ? 'border-sage-600 text-sage-700' : 'border-line')}>
                {i < current ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <div key={current} className="min-w-0 animate-fade-up">
          <h1 className="text-[26px] font-semibold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[15px] text-ink-soft">{subtitle}</p>}
          <div className="mt-7 space-y-6">{children}</div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-6">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function Section({ title, description, children, icon }: { title: string; description?: ReactNode; children: ReactNode; icon?: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line/80 bg-paper p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        {icon && <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-50 text-sage-700">{icon}</div>}
        <div>
          <h2 className="text-[16px] font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-[13.5px] text-muted">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
