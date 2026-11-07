import { Link } from 'react-router-dom';
import { cx } from './ui';

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#5f7854" />
      <circle cx="12" cy="13.5" r="4.4" fill="#f6f1e7" />
      <circle cx="20.2" cy="13.5" r="4.4" fill="#f6f1e7" fillOpacity=".62" />
      <path d="M6.8 25.2c1.3-3.5 3.1-5.1 5.2-5.1s3.9 1.6 5.2 5.1M15 25.2c1.3-3.5 3.1-5.1 5.2-5.1s3.9 1.6 5.2 5.1" stroke="#f6f1e7" strokeWidth="2.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ to = '/', className, light }: { to?: string; className?: string; light?: boolean }) {
  return (
    <Link to={to} className={cx('inline-flex items-center gap-2.5', className)} aria-label="FamiliarFaces home">
      <LogoMark />
      <span className={cx('font-mono text-[16px] font-semibold tracking-normal', light ? 'text-cream' : 'text-ink')}>
        Familiar<span className={light ? 'text-sage-300' : 'text-sage-600'}>Faces</span>
      </span>
    </Link>
  );
}
