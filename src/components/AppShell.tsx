import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookHeart, CalendarClock, ChevronDown, HandHeart, Heart, Inbox, LayoutDashboard, LifeBuoy, LogOut, Menu, Search,
  Settings, UserRound, X, ClipboardCheck,
} from 'lucide-react';
import { useStore, useFamilyView, useStudentView } from '../lib/store';
import { Logo } from './Logo';
import { Avatar, cx } from './ui';

interface NavItem { to: string; label: string; icon: ReactNode; badge?: number }

function useNav(): NavItem[] {
  const { user } = useStore();
  const sv = useStudentView();
  const fv = useFamilyView();
  if (user?.role === 'family') {
    const pendingReq = fv.requests.filter((r) => r.status === 'pending').length;
    return [
      { to: '/family', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
      { to: '/family/find', label: 'Find a Volunteer', icon: <Search className="h-[18px] w-[18px]" /> },
      { to: '/family/requests', label: 'Companion Requests', icon: <Inbox className="h-[18px] w-[18px]" />, badge: pendingReq },
      { to: '/family/visits', label: 'Visits & Approvals', icon: <ClipboardCheck className="h-[18px] w-[18px]" />, badge: fv.stats.pendingApprovals.length },
      { to: '/family/journal', label: 'Journal', icon: <BookHeart className="h-[18px] w-[18px]" /> },
      { to: '/family/loved-one', label: "Loved One's Profile", icon: <Heart className="h-[18px] w-[18px]" /> },
      { to: '/family/support', label: 'Support', icon: <LifeBuoy className="h-[18px] w-[18px]" /> },
    ];
  }
  return [
    { to: '/student', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
    { to: '/student/find', label: 'Find a Companion', icon: <Search className="h-[18px] w-[18px]" /> },
    { to: '/student/commitment', label: 'My Commitment', icon: <HandHeart className="h-[18px] w-[18px]" /> },
    { to: '/student/visits', label: 'Visits & Hours', icon: <CalendarClock className="h-[18px] w-[18px]" />, badge: sv.activeVisit ? 1 : 0 },
    { to: '/student/journal', label: 'Journal', icon: <BookHeart className="h-[18px] w-[18px]" /> },
    { to: '/student/profile', label: 'Profile', icon: <UserRound className="h-[18px] w-[18px]" /> },
    { to: '/student/support', label: 'Support', icon: <LifeBuoy className="h-[18px] w-[18px]" /> },
  ];
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const items = useNav();
  const { user } = useStore();
  const home = user?.role === 'family' ? '/family' : '/student';
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-5"><Logo to={home} /></div>
      <p className="label-mono px-6 pb-2">{user?.role === 'family' ? 'Family' : 'Volunteer'}</p>
      <nav className="flex-1 space-y-0.5 px-3" aria-label="Main">
        {items.map((it) => (
          <NavLink
            key={it.to} to={it.to} end={it.to === home} onClick={onNavigate}
            className={({ isActive }) => cx(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-[13px] transition-all duration-200',
              isActive ? 'bg-sage-700 text-cream shadow-[0_8px_20px_-12px_rgba(58,74,53,.9)]' : 'text-ink-soft hover:bg-sage-50 hover:text-ink',
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cx('transition', isActive ? 'text-sage-200' : 'text-sage-500 group-hover:text-sage-700')}>{it.icon}</span>
                <span className="flex-1">{it.label}</span>
                {!!it.badge && <span className={cx('grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-semibold', isActive ? 'bg-cream text-sage-800' : 'bg-clay-500 text-white')}>{it.badge}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-2xl border border-sage-200/70 bg-gradient-to-br from-sage-50 to-olive-100/50 p-4">
        <p className="font-mono text-[12px] font-semibold text-sage-800">Consistency Builds Trust</p>
        <p className="mt-1 text-[12px] leading-relaxed text-sage-800/75">Familiar faces, week after week, make the biggest difference for residents living with dementia.</p>
      </div>
    </div>
  );
}

function AccountMenu() {
  const { user, signOut, data } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const photo = user?.role === 'student' ? data.students[user.id]?.photo : null;

  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!user) return null;
  const go = (path: string) => { setOpen(false); navigate(path); };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full border border-transparent py-1 pl-1 pr-2.5 transition hover:border-line hover:bg-paper">
        <Avatar photo={photo} name={user.displayName} size={34} />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[160px] truncate font-mono text-[12.5px] font-medium leading-tight">{user.displayName}</span>
          <span className="block text-[11px] leading-tight text-muted">{user.role === 'family' ? 'Family Member' : 'Student Volunteer'}</span>
        </span>
        <ChevronDown className={cx('h-4 w-4 text-muted transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-72 animate-scale-in overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_24px_48px_-20px_rgba(44,49,39,.35)]">
          <div className="border-b border-line/70 px-4 py-3">
            <p className="truncate font-mono text-[13px] font-semibold">{user.displayName}</p>
            <p className="truncate text-[12px] text-muted">{user.email}</p>
          </div>
          <div className="p-1.5">
            <MenuItem icon={<Settings className="h-4 w-4" />} onClick={() => go('/settings')}>Account Settings</MenuItem>
          </div>
          <div className="border-t border-line/70 p-1.5">
            <MenuItem icon={<LogOut className="h-4 w-4" />} onClick={() => { setOpen(false); signOut(); navigate('/'); }}>Sign Out</MenuItem>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, children, onClick, disabled }: { icon: ReactNode; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] text-ink transition hover:bg-sage-50 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent">
      <span className="text-sage-600">{icon}</span>{children}{disabled && <span className="ml-auto text-[11px] text-muted">Current</span>}
    </button>
  );
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { storageWarning } = useStore();
  useEffect(() => { setMobileOpen(false); window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line/70 bg-paper/70 backdrop-blur lg:block">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-in border-r border-line bg-paper shadow-2xl">
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-lg hover:bg-sand"><X className="h-5 w-5" /></button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line/60 bg-cream/85 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-paper lg:hidden"><Menu className="h-5 w-5" /></button>
            <span className="lg:hidden"><Logo /></span>
          </div>
          <AccountMenu />
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-8">
          {storageWarning && (
            <div className="mb-6 rounded-xl border border-clay-300 bg-clay-100 px-4 py-2 text-[13px] text-clay-700">
              Your browser's storage is full, so recent changes may not be saved. Try removing a profile photo.
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
