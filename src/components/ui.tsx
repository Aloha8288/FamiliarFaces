import {
  createContext, useCallback, useContext, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react';
import { Link } from 'react-router-dom';
import { Camera, Check, CheckCircle2, Info, Plus, UserRound, X } from 'lucide-react';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ---------------- Button ---------------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-sage-700 text-cream hover:bg-sage-800 shadow-[0_1px_0_rgba(255,255,255,.15)_inset,0_6px_16px_-8px_rgba(58,74,53,.6)]',
  secondary: 'bg-paper text-ink border border-line hover:border-sage-300 hover:bg-white',
  ghost: 'text-ink-soft hover:bg-sage-50 hover:text-ink',
  danger: 'bg-paper text-rose-deep border border-rose-soft hover:bg-rose-soft',
  soft: 'bg-sage-100 text-sage-800 hover:bg-sage-200',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13px] gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[14px] gap-2 rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', to, icon, iconRight, className, children, ...rest }: ButtonProps) {
  const cls = cx(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-mono font-medium tracking-normal transition-all duration-200',
    'active:scale-[.98] disabled:pointer-events-none disabled:opacity-45',
    variants[variant], sizes[size], className,
  );
  const content = (<>{icon}{children}{iconRight}</>);
  if (to) return <Link to={to} className={cls}>{content}</Link>;
  return <button type="button" className={cls} {...rest}>{content}</button>;
}

/* ---------------- Card ---------------- */
export function Card({ className, children, hover, ...rest }: { className?: string; children: ReactNode; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'rounded-[var(--radius-card)] border border-line/80 bg-paper shadow-[0_1px_2px_rgba(44,49,39,.04)]',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:border-sage-200 hover:shadow-[0_16px_36px_-20px_rgba(58,74,53,.35)]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/70 px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sage-50 text-sage-700">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ---------------- Badge ---------------- */
const badgeTones = {
  sage: 'bg-sage-100 text-sage-800',
  olive: 'bg-olive-100 text-olive-700',
  clay: 'bg-clay-100 text-clay-700',
  rose: 'bg-rose-soft text-rose-deep',
  neutral: 'bg-sand text-ink-soft',
  outline: 'border border-line text-ink-soft',
};
export function Badge({ tone = 'neutral', children, icon, className }: { tone?: keyof typeof badgeTones; children: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium', badgeTones[tone], className)}>
      {icon}{children}
    </span>
  );
}

/* ---------------- Progress ---------------- */
export function ProgressBar({ value, className, label, size = 'md' }: { value: number; className?: string; label?: string; size?: 'sm' | 'md' | 'lg' }) {
  const v = Math.max(0, Math.min(100, value));
  const h = size === 'lg' ? 'h-3.5' : size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-sand', h, className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-sage-500 to-sage-700 transition-[width] duration-700 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

/* ---------------- Form fields ---------------- */
export function Field({ label, hint, error, required, children, htmlFor, className }: {
  label: ReactNode; hint?: ReactNode; error?: string | null; required?: boolean; children: ReactNode; htmlFor?: string; className?: string;
}) {
  return (
    <div className={cx('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink">
        {label}{required && <span className="ml-0.5 text-clay-500" aria-hidden>*</span>}
      </label>
      {children}
      {error ? <p className="text-[12px] text-rose-deep" role="alert">{error}</p> : hint ? <p className="text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx('field-input', props.className)} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cx('field-input resize-y leading-relaxed', props.className)} />;
}
export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cx('field-input appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10', props.className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237c8273' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}>
      {children}
    </select>
  );
}

/* ---------------- Chips ---------------- */
export function Chip({ selected, onClick, children, disabled }: { selected: boolean; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-all duration-200 active:scale-[.97]',
        selected
          ? 'border-sage-600 bg-sage-700 text-cream shadow-[0_4px_12px_-6px_rgba(58,74,53,.7)]'
          : 'border-line bg-paper text-ink-soft hover:border-sage-300 hover:bg-sage-50 hover:text-ink',
        disabled && 'opacity-50',
      )}
    >
      <span className={cx('grid h-3.5 w-3.5 place-items-center rounded-full transition', selected ? 'bg-cream/20' : 'border border-line group-hover:border-sage-300')}>
        {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

/**
 * Multi-select chip group. `exclusive` options (e.g. "No Preference") clear the others when selected.
 * When "Other" is selected, an inline text input is shown.
 */
export function ChipGroup({ options, value, onChange, exclusive = [], otherValue, onOtherChange, otherPlaceholder, label }: {
  options: string[]; value: string[]; onChange: (v: string[]) => void; exclusive?: string[];
  otherValue?: string; onOtherChange?: (v: string) => void; otherPlaceholder?: string; label?: string;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) return onChange(value.filter((v) => v !== opt));
    if (exclusive.includes(opt)) return onChange([opt]);
    onChange([...value.filter((v) => !exclusive.includes(v)), opt]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => <Chip key={o} selected={value.includes(o)} onClick={() => toggle(o)}>{o}</Chip>)}
      </div>
      {onOtherChange && value.includes('Other') && (
        <Input className="mt-3 max-w-md animate-fade-in" placeholder={otherPlaceholder ?? 'Please specify'} value={otherValue ?? ''} onChange={(e) => onOtherChange(e.target.value)} aria-label="Other, please specify" />
      )}
    </div>
  );
}

/** Lets users add their own free-text tags (custom interests). */
export function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (!value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setDraft('');
  };
  return (
    <div>
      <div className="flex max-w-md gap-2">
        <Input value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} aria-label={placeholder ?? 'Add custom entry'} />
        <Button variant="secondary" onClick={add} icon={<Plus className="h-4 w-4" />} disabled={!draft.trim()}>Add</Button>
      </div>
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full border border-olive-300 bg-olive-100 py-1 pl-3 pr-1.5 text-[13px] text-olive-700">
              {t}
              <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((v) => v !== t))} className="grid h-5 w-5 place-items-center rounded-full hover:bg-olive-300/50">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Checkbox({ checked, onChange, children, id }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; id?: string }) {
  const autoId = useId();
  const cid = id ?? autoId;
  return (
    <label htmlFor={cid} className="flex cursor-pointer items-start gap-3 text-[14px] text-ink">
      <span className="relative mt-0.5">
        <input id={cid} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="grid h-5 w-5 place-items-center rounded-md border border-sage-300 bg-paper transition peer-checked:border-sage-700 peer-checked:bg-sage-700 peer-focus-visible:ring-4 peer-focus-visible:ring-sage-100">
          {checked && <Check className="h-3.5 w-3.5 text-cream" strokeWidth={3} />}
        </span>
      </span>
      <span>{children}</span>
    </label>
  );
}

/* ---------------- Avatar & photo ---------------- */
export function Avatar({ photo, name, size = 40, className }: { photo?: string | null; name?: string; size?: number; className?: string }) {
  return (
    <div
      className={cx('relative shrink-0 overflow-hidden rounded-full border border-line bg-gradient-to-br from-sand to-sage-100 text-sage-600', className)}
      style={{ width: size, height: size }}
      aria-label={name ? `${name} profile photo` : 'Profile photo placeholder'}
      role="img"
    >
      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : (
        <div className="grid h-full w-full place-items-center">
          <UserRound style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

async function resizeImage(file: File, max = 320): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PhotoUpload({ value, onChange, label = 'Profile Photo' }: { value: string | null; onChange: (v: string | null) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => ref.current?.click()} className="group relative rounded-full" aria-label={value ? 'Change photo' : 'Upload photo'}>
        <Avatar photo={value} size={80} />
        <span className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center rounded-full border-2 border-paper bg-sage-700 text-cream transition group-hover:scale-105">
          <Camera className="h-3.5 w-3.5" />
        </span>
      </button>
      <div>
        <p className="text-[13px] font-medium">{label} <span className="font-normal text-muted">(Optional)</span></p>
        <div className="mt-1.5 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => ref.current?.click()}>{value ? 'Replace Photo' : 'Upload Photo'}</Button>
          {value && <Button size="sm" variant="ghost" onClick={() => onChange(null)}>Remove</Button>}
        </div>
        {err && <p className="mt-1 text-[12px] text-rose-deep">{err}</p>}
      </div>
      <input
        ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          if (!f.type.startsWith('image/')) return setErr('Please choose an image file.');
          try { setErr(''); onChange(await resizeImage(f)); } catch { setErr('That image couldn\'t be read. Try another.'); }
        }}
      />
    </div>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cx('relative flex max-h-[92vh] w-full animate-scale-in flex-col rounded-t-3xl border border-line bg-paper shadow-2xl sm:rounded-3xl', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between gap-4 border-b border-line/70 px-6 py-4">
          <h2 className="text-[17px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line/70 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------------- Misc ---------------- */
export function PageHeader({ title, subtitle, action, eyebrow }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-fade-up">
        {eyebrow && <p className="label-mono mb-2">{eyebrow}</p>}
        <h1 className="text-[26px] font-semibold sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-soft">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-sage-50 text-sage-600">{icon}</div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-[14px] text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({ children, tone = 'info', title }: { children: ReactNode; tone?: 'info' | 'warn' | 'success'; title?: string }) {
  const styles = {
    info: 'border-sage-200 bg-sage-50 text-sage-900',
    warn: 'border-clay-300/60 bg-clay-100/70 text-clay-700',
    success: 'border-sage-300 bg-sage-100 text-sage-900',
  }[tone];
  const Icon = tone === 'success' ? CheckCircle2 : Info;
  return (
    <div className={cx('flex gap-3 rounded-2xl border px-4 py-3 text-[13px] leading-relaxed', styles)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{title && <p className="mb-0.5 font-semibold">{title}</p>}{children}</div>
    </div>
  );
}

export function Stat({ label, value, icon, sub }: { label: string; value: ReactNode; icon?: ReactNode; sub?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="label-mono">{label}</p>
        {icon && <span className="text-sage-500">{icon}</span>}
      </div>
      <p className="mt-2 font-mono text-[26px] font-semibold tracking-normal text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-muted">{sub}</p>}
    </Card>
  );
}

/* ---------------- Toasts ---------------- */
interface Toast { id: number; message: string; tone: 'success' | 'info' | 'error' }
const ToastCtx = createContext<(message: string, tone?: Toast['tone']) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-1), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={cx('pointer-events-auto flex max-w-md animate-scale-in items-center gap-2.5 rounded-2xl px-4 py-3 text-[13px] shadow-xl',
            t.tone === 'error' ? 'bg-rose-deep text-white' : 'bg-ink text-cream')}>
            {t.tone === 'error' ? <Info className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-300" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
