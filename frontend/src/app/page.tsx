import { ArrowRight, Check, MoveRight } from 'lucide-react';
import Link from 'next/link';
import { AcademyMark, FullAcademyLogo } from '@/components/brand/academy-mark';

const journey = [
  ['01', 'Apply', 'One clear entry point for every prospective learner.'],
  ['02', 'Learn', 'Cohorts, attendance and progress stay connected.'],
  ['03', 'Build', 'Mentors see who is moving and who needs support.'],
  ['04', 'Progress', 'Learners understand where they are and what comes next.'],
] as const;

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#f7f4ef] text-[#191716]">
      <header className="relative z-10 mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <AcademyMark />
        <Link href="/login" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#191716]/15 bg-white px-5 text-sm font-bold transition hover:border-[#65000b]/40 hover:text-[#65000b]">
          Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <section className="relative mx-auto grid min-h-[650px] max-w-[1180px] items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
        <div className="relative z-[1] max-w-2xl">
          <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#65000b]">Academy management, connected</p>
          <h1 className="max-w-[720px] text-[clamp(3.1rem,7vw,6.2rem)] font-extrabold leading-[.91] tracking-[-.065em]">
            Every learner.<br />One clear journey.
          </h1>
          <p className="mt-7 max-w-xl text-[17px] font-medium leading-8 text-[#5f5955] sm:text-lg">
            PTA System brings applications, cohorts, attendance and learner progress into one dependable workspace for the Academy team.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/login" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#65000b] px-7 text-[15px] font-extrabold text-white shadow-[0_18px_40px_-22px_rgba(101,0,11,.8)] transition hover:bg-[#470008]">
              Open your workspace <MoveRight className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f6965]">
              <Check className="h-4 w-4 text-[#0f766e]" aria-hidden="true" /> Built around the learner journey
            </span>
          </div>
        </div>

        <div className="relative min-h-[500px] lg:min-h-[620px]">
          <div className="absolute inset-0 rounded-[48px_16px_48px_16px] bg-[#65000b] shadow-[0_40px_100px_-45px_rgba(71,0,8,.75)]" />
          <div className="absolute inset-x-6 top-7 rounded-[32px] border border-white/10 bg-[#4f0009] p-6 text-white sm:inset-x-10 sm:top-10 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <p className="text-sm font-bold">Learner journey</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-white/70">Live record</span>
            </div>
            <ol className="mt-2 divide-y divide-white/10">
              {journey.map(([number, title, body]) => (
                <li key={title} className="grid grid-cols-[42px_1fr] gap-3 py-5">
                  <span className="pt-1 font-mono text-[11px] text-white/45">{number}</span>
                  <span>
                    <span className="block text-[17px] font-extrabold">{title}</span>
                    <span className="mt-1 block text-[13px] font-medium leading-5 text-white/60">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="absolute bottom-4 left-3 rounded-2xl bg-[#f0d39d] px-5 py-4 text-[#3d2910] shadow-xl sm:bottom-6 sm:left-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[.13em] opacity-60">North star</p>
            <p className="mt-1 text-sm font-extrabold">Learn. Build. Innovate. Progress.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#191716]/10 bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-px bg-[#191716]/10 sm:grid-cols-3">
          {[
            ['For administrators', 'A reliable academy-wide view without scattered spreadsheets.'],
            ['For mentors', 'The right learner context before small problems become setbacks.'],
            ['For learners', 'A simple view of progress, attendance and the next step.'],
          ].map(([title, body]) => (
            <div key={title} className="bg-white px-6 py-10 sm:px-8">
              <h2 className="text-[15px] font-extrabold">{title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-[#6f6965]">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-[#191716]/10 bg-white px-5 py-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-5 sm:flex-row">
          <FullAcademyLogo className="w-[112px]" />
          <p className="text-center text-xs font-semibold text-[#817a75] sm:text-right">
            Pivosoft Technology Academy<br />Learn. Build. Innovate. Progress.
          </p>
        </div>
      </footer>
    </main>
  );
}
