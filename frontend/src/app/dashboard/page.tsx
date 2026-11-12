'use client';

import { CalendarDays, CheckCircle2, Fingerprint, MoveRight } from 'lucide-react';
import { format } from 'date-fns';
import { DirectionLink, RoleBadge } from '@/components/dashboard/app-shell';
import { useAuthStore } from '@/stores/auth';

const copy = {
  ADMIN: {
    eyebrow: 'Academy operations',
    title: 'A clear home for the learner journey.',
    body: 'Applications, learners, programmes and cohorts will come together here as each operational stage is connected.',
    next: ['Application review', 'Learner directory', 'Programme setup'],
  },
  MENTOR: {
    eyebrow: 'Mentor workspace',
    title: 'The right context before every conversation.',
    body: 'Your assigned learners, attendance signals and progress views will appear here as the Academy data modules come online.',
    next: ['Assigned learners', 'Attendance recording', 'Progress signals'],
  },
  INSTRUCTOR: {
    eyebrow: 'Instructor workspace',
    title: 'Teaching activity, kept in context.',
    body: 'Programme structure and cohort attendance will be connected here in the upcoming delivery stages.',
    next: ['Programme structure', 'Cohort view', 'Attendance sessions'],
  },
  LEARNER: {
    eyebrow: 'My learning',
    title: 'Know where you are. See what comes next.',
    body: 'Your programme, cohort, attendance and progress will appear here once the Academy has connected your learning record.',
    next: ['My programme', 'My attendance', 'My progress'],
  },
  ALUMNI: {
    eyebrow: 'Alumni',
    title: 'Stay connected to the Academy.',
    body: 'Alumni features are planned for a later release. Your secure account is ready for that journey.',
    next: ['Profile', 'Academy network', 'Career updates'],
  },
} as const;

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)!;
  const content = copy[user.role];

  return (
    <main className="px-5 pb-12 pt-7 sm:px-8 lg:px-10 lg:pb-10 lg:pt-9 xl:px-14">
      <header className="flex flex-col justify-between gap-4 border-b border-[#191716]/10 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold text-[#817a75]">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,3.15rem)] font-extrabold tracking-[-.045em]">Good to see you, {user.firstName}.</h1>
        </div>
        <RoleBadge />
      </header>

      <section className="mt-7 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <article className="relative min-h-[390px] overflow-hidden rounded-[30px] bg-[#191716] p-7 text-white sm:p-10">
          <div className="relative z-[1] flex h-full max-w-xl flex-col">
            <p className="text-[11px] font-extrabold uppercase tracking-[.17em] text-[#e7b5b8]">{content.eyebrow}</p>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.8rem)] font-extrabold leading-[.98] tracking-[-.055em]">{content.title}</h2>
            <p className="mt-6 max-w-lg text-[15px] font-medium leading-7 text-white/55">{content.body}</p>
            <div className="mt-auto flex items-center gap-2 pt-10 text-xs font-bold text-white/65">
              <CheckCircle2 className="h-4 w-4 text-[#e48d8a]" /> Secure account and session are active
            </div>
          </div>
          <div aria-hidden="true" className="absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full border-[90px] border-[#65000b] opacity-70" />
        </article>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <article className="rounded-[26px] border border-[#191716]/10 bg-white p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#65000b]/[.07] text-[#65000b]"><Fingerprint className="h-5 w-5" /></span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e] shadow-[0_0_0_5px_rgba(15,118,110,.1)]" />
            </div>
            <h2 className="mt-7 text-lg font-extrabold">Account connected</h2>
            <p className="mt-1 truncate text-sm font-medium text-[#6f6965]">{user.email}</p>
            <div className="mt-6"><DirectionLink>Session protected</DirectionLink></div>
          </article>

          <article className="rounded-[26px] bg-[#f0d39d] p-6 text-[#3d2910] sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/45"><CalendarDays className="h-5 w-5" /></span>
            <h2 className="mt-7 text-lg font-extrabold">Next to connect</h2>
            <ul className="mt-4 space-y-3">
              {content.next.map((item, index) => (
                <li key={item} className="flex items-center gap-3 text-sm font-bold">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/50 text-[10px]">{index + 1}</span>{item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <footer className="mt-7 flex flex-col justify-between gap-4 rounded-[22px] border border-[#191716]/10 bg-white px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-extrabold">PTA System · Stage 1</p>
          <p className="mt-0.5 text-xs font-medium text-[#817a75]">Authentication and role-aware workspace</p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-bold text-[#65000b]">Learn · Build · Innovate · Progress <MoveRight className="h-4 w-4" /></span>
      </footer>
    </main>
  );
}
