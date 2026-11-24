'use client';

import { ArrowRight, BarChart3, BookOpenCheck, ClipboardCheck, FileText, GraduationCap, School, Users } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { RoleBadge } from '@/components/dashboard/app-shell';
import { useAuthStore } from '@/stores/auth';

const actions = {
  ADMIN: [
    ['/dashboard/applications', 'Review applications', 'Move applicants into the Academy learner journey.', FileText],
    ['/dashboard/learners', 'Manage learners', 'Assign cohorts and see current progress signals.', Users],
    ['/dashboard/cohorts', 'Organise cohorts', 'Create delivery groups and check enrollment.', School],
    ['/dashboard/reports', 'Read Academy reports', 'See live admissions, attendance and progress.', BarChart3],
  ],
  MENTOR: [
    ['/dashboard/attendance', 'Record attendance', 'Create a class register and mark every learner.', ClipboardCheck],
    ['/dashboard/progress', 'Update progress', 'Mark completed modules and identify learners at risk.', BookOpenCheck],
    ['/dashboard/learners', 'View my learners', 'Keep cohort context close before every conversation.', Users],
  ],
  INSTRUCTOR: [
    ['/dashboard/attendance', 'Record attendance', 'Create a class register and mark every learner.', ClipboardCheck],
    ['/dashboard/progress', 'Update progress', 'Mark completed modules and identify learners at risk.', BookOpenCheck],
    ['/dashboard/learners', 'View my learners', 'See the learners assigned to your cohorts.', Users],
  ],
  LEARNER: [['/dashboard/my-learning', 'Open my learning record', 'See your cohort, attendance, modules and latest progress.', GraduationCap]],
  ALUMNI: [] as const,
} as const;

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)!;
  const items = actions[user.role];
  return (
    <main className="px-5 pb-12 pt-7 sm:px-8 lg:px-10 lg:pt-9 xl:px-14">
      <header className="flex flex-col justify-between gap-4 border-b border-[#191716]/10 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold text-[#817a75]">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          <h1 className="mt-2 text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold tracking-[-.05em]">Good to see you, {user.firstName}.</h1>
          <p className="mt-2 text-sm font-medium text-[#6f6965]">Your Academy workspace is ready.</p>
        </div>
        <RoleBadge />
      </header>
      <section className="mt-7 grid gap-5 md:grid-cols-2">
        {items.map(([href, title, body, Icon], index) => (
          <Link key={href} href={href} className={`group relative min-h-56 overflow-hidden rounded-[28px] p-7 transition hover:-translate-y-0.5 ${index === 0 ? 'bg-[#65000b] text-white' : 'border border-[#191716]/10 bg-white'}`}>
            <Icon className={`h-6 w-6 ${index === 0 ? 'text-white/55' : 'text-[#65000b]'}`} />
            <h2 className="mt-12 text-2xl font-extrabold tracking-[-.035em]">{title}</h2>
            <p className={`mt-2 max-w-md text-sm font-medium leading-6 ${index === 0 ? 'text-white/60' : 'text-[#6f6965]'}`}>{body}</p>
            <ArrowRight className="absolute right-7 top-7 h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
        ))}
      </section>
      <footer className="mt-8 border-t border-[#191716]/10 pt-5 text-xs font-semibold text-[#817a75]">PTA System · Learn · Build · Innovate · Progress</footer>
    </main>
  );
}
