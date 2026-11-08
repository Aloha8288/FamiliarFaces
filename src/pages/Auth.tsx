import { useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { cx } from '../components/ui';
import { useStore } from '../lib/store';

/** Desktop: brand panel beside the form. Phones: full-screen app layout. */
function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] bg-cream lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sage-600 via-sage-700 to-sage-800 p-14 text-cream lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full bg-sage-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-olive-500/30 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <LogoMark size={44} />
          <span className="font-mono text-[22px] font-semibold">Familiar<span className="text-sage-200">Faces</span></span>
        </div>
        <div className="relative max-w-lg animate-fade-up">
          <h1 className="text-[46px] font-semibold leading-[1.1] !text-cream">Meaningful Connections.<br /><span className="text-sage-200">Familiar Faces.</span></h1>
          <p className="mt-5 text-[17px] leading-relaxed text-cream/75">
            For people living with dementia, a familiar face makes all the difference. We match student volunteers with care-home residents for regular visits that build real friendships.
          </p>
        </div>
        <p className="relative font-mono text-[12px] text-cream/50">NatHacks 2026</p>
      </aside>
      <main className="flex min-h-[100dvh] flex-col">{children}</main>
    </div>
  );
}

function IconInput({ icon, trailing, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
      <input {...props} className="h-[52px] w-full rounded-2xl border border-line bg-paper pl-11 pr-12 text-[15px] text-ink placeholder:text-muted/70 transition focus:border-sage-500 focus:outline-none focus:ring-4 focus:ring-sage-100" />
      {trailing && <span className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
  );
}

export default function Auth({ mode: initialMode }: { mode: 'signin' | 'register' }) {
  // Mode lives in state so switching tabs keeps whatever you've already typed.
  const [mode, setMode] = useState(initialMode);
  const store = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const isRegister = mode === 'register';
  const { user } = store;

  // Already signed in? Go straight to the right place.
  if (user) {
    const to = !user.role ? '/welcome' : !user.onboarded ? `/onboarding/${user.role}` : user.role === 'family' ? '/family' : '/student';
    return <Navigate to={to} replace />;
  }

  const submit = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!email.trim()) return setError('Please enter an email.');
    if (!password) return setError('Please enter a password.');
    const res = isRegister ? store.register(email, password, name) : store.signIn(email, password);
    if (!res.ok) return setError(res.error);
    setError('');
  };


  return (
    <AuthLayout>
      <div className="flex min-h-full flex-1 flex-col">
        {/* Header (phones only) */}
        <div className="relative overflow-hidden rounded-b-[36px] lg:hidden bg-gradient-to-br from-sage-600 via-sage-700 to-sage-800 px-7 pb-10 pt-[max(3.5rem,calc(env(safe-area-inset-top,0px)+2rem))] text-cream">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-sage-400/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-6 h-40 w-40 rounded-full bg-olive-500/30 blur-2xl" />
          <div className="relative animate-fade-up">
            <div className="inline-flex rounded-[22px] bg-cream/15 p-2.5 ring-1 ring-cream/20 backdrop-blur"><LogoMark size={52} /></div>
            <h1 className="mt-5 text-[28px] font-semibold !text-cream">
              Familiar<span className="text-sage-200">Faces</span>
            </h1>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-cream/75">Meaningful Connections. Familiar Faces.</p>
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-7 lg:justify-center lg:py-12">
          <div className="grid grid-cols-2 rounded-2xl bg-sand p-1" role="tablist" aria-label="Account">
            {(['signin', 'register'] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m}
                onClick={() => { setError(''); setMode(m); }}
                className={cx('h-10 rounded-xl font-mono text-[13px] font-medium transition-all', mode === m ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft hover:text-ink')}>
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-[20px] font-semibold">{isRegister ? 'Join FamiliarFaces' : 'Welcome Back'}</h2>
            <p className="mt-1 text-[14px] text-ink-soft">{isRegister ? 'Create your account in under a minute.' : 'Sign in to continue to your dashboard.'}</p>

            <div className="mt-5 space-y-3" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}>
              {isRegister && (
                <IconInput id="name" aria-label="Your name" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} icon={<UserRound className="h-[18px] w-[18px]" />} />
              )}
              <IconInput id="email" type="text" inputMode="email" autoCapitalize="none" spellCheck={false} aria-label="Email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="h-[18px] w-[18px]" />} />
              <IconInput id="password" type={show ? 'text' : 'password'} aria-label="Password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="h-[18px] w-[18px]" />}
                trailing={
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-sand hover:text-ink">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                } />
              {error && <p className="rounded-xl bg-rose-soft px-3.5 py-2.5 text-[13px] text-rose-deep" role="alert">{error}</p>}
              <button type="button" onClick={() => submit()} data-testid="auth-submit" className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-sage-700 font-mono text-[14px] font-medium text-cream shadow-[0_10px_24px_-12px_rgba(58,74,53,.9)] transition hover:bg-sage-800 active:scale-[.98]">
                {isRegister ? 'Create My Account' : 'Sign In'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </AuthLayout>
  );
}
