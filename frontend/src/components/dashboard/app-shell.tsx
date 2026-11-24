'use client';

import { BarChart3, BookOpenCheck, ChevronRight, ClipboardCheck, FileText, GraduationCap, LayoutDashboard, LogOut, Menu, School, ShieldCheck, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AcademyMark } from '@/components/brand/academy-mark';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth';

const roleLabels = {
  ADMIN: 'Administrator',
  MENTOR: 'Mentor',
  INSTRUCTOR: 'Instructor',
  LEARNER: 'Learner',
  ALUMNI: 'Alumni',
} as const;

const roleNavigation = {
  ADMIN: [
    ['/dashboard', 'Overview', LayoutDashboard],
    ['/dashboard/applications', 'Applications', FileText],
    ['/dashboard/learners', 'Learners', Users],
    ['/dashboard/cohorts', 'Cohorts', School],
    ['/dashboard/attendance', 'Attendance', ClipboardCheck],
    ['/dashboard/progress', 'Progress', BookOpenCheck],
    ['/dashboard/reports', 'Reports', BarChart3],
  ],
  MENTOR: [
    ['/dashboard', 'Overview', LayoutDashboard],
    ['/dashboard/learners', 'My learners', Users],
    ['/dashboard/attendance', 'Attendance', ClipboardCheck],
    ['/dashboard/progress', 'Progress', BookOpenCheck],
  ],
  INSTRUCTOR: [
    ['/dashboard', 'Overview', LayoutDashboard],
    ['/dashboard/learners', 'My learners', Users],
    ['/dashboard/attendance', 'Attendance', ClipboardCheck],
    ['/dashboard/progress', 'Progress', BookOpenCheck],
  ],
  LEARNER: [
    ['/dashboard', 'Overview', LayoutDashboard],
    ['/dashboard/my-learning', 'My learning', GraduationCap],
  ],
  ALUMNI: [['/dashboard', 'Overview', LayoutDashboard]],
} as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearSession } = useAuthStore();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const logout = async () => {
    try { await authApi.logout(); } finally {
      clearSession();
      router.replace('/login');
    }
  };

  const rail = (
    <aside className="flex h-full w-[278px] flex-col bg-[#65000b] px-5 py-6 text-white">
      <AcademyMark inverse className="px-2" />
      <nav className="mt-12" aria-label="Workspace">
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-white/40">Workspace</p>
        <div className="mt-3 space-y-1">
          {roleNavigation[user.role].map(([href, label, Icon]) => {
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${active ? 'bg-white text-[#65000b]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="h-[18px] w-[18px]" /> {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-black/10 p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-xs font-extrabold">
            {user.firstName[0]}{user.lastName[0]}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-extrabold">{user.firstName} {user.lastName}</span>
            <span className="block truncate text-[10.5px] font-semibold text-white/50">{roleLabels[user.role]}</span>
          </span>
        </div>
        <button onClick={logout} className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-xs font-bold text-white/55 transition hover:bg-white/10 hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-dvh bg-[#e9e4dd] lg:p-3">
      <div className="mx-auto min-h-dvh max-w-[1540px] overflow-hidden bg-[#f7f4ef] lg:grid lg:min-h-[calc(100dvh-24px)] lg:grid-cols-[278px_1fr] lg:rounded-[28px] lg:shadow-[0_22px_70px_-40px_rgba(25,23,22,.5)]">
        <div className="hidden lg:block">{rail}</div>

        <div className="min-w-0">
          <header className="flex h-[72px] items-center justify-between border-b border-[#191716]/10 bg-[#f7f4ef]/90 px-5 backdrop-blur lg:hidden">
            <AcademyMark compact />
            <button onClick={() => setOpen(true)} aria-label="Open navigation" className="grid h-11 w-11 place-items-center rounded-2xl border border-[#191716]/10 bg-white">
              <Menu className="h-5 w-5" />
            </button>
          </header>
          {children}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-[min(86vw,300px)]" onClick={(event) => event.stopPropagation()}>
            <div className="relative h-full">
              {rail}
              <button onClick={() => setOpen(false)} aria-label="Close navigation" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RoleBadge() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#65000b]/15 bg-[#65000b]/[.06] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.08em] text-[#65000b]">
      <ShieldCheck className="h-3.5 w-3.5" /> {roleLabels[user.role]}
    </span>
  );
}

export function DirectionLink({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#65000b]">{children}<ChevronRight className="h-3.5 w-3.5" /></span>;
}
