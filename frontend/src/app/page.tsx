import { ArrowRight, Check, MoveRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AcademyMark, FullAcademyLogo } from '@/components/brand/academy-mark';

const journey = ['Apply', 'Learn', 'Build', 'Progress'] as const;

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#f7f4ef] text-[#191716]">
      <header className="relative z-20 border-b border-[#191716]/8 bg-[#f7f4ef]/95">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <AcademyMark />
          <nav className="flex items-center gap-4 sm:gap-5" aria-label="Primary navigation">
            <a href="#how-it-works" className="hidden text-sm font-bold text-[#5f5955] transition hover:text-[#65000b] sm:block">
              How it works
            </a>
            <Link href="/apply" className="hidden text-sm font-bold text-[#65000b] transition hover:text-[#470008] sm:block">Apply</Link>
            <Link href="/login" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#191716] px-5 text-sm font-bold text-white transition hover:bg-[#65000b]">
              Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate min-h-[680px] lg:h-[calc(100dvh-80px)] lg:min-h-[620px] lg:max-h-[820px]">
        <Image
          src="/brand/academy-students-hero.png"
          alt="Pivosoft Technology Academy students collaborating around their laptops"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[66%_center]"
        />
        <div
          className="absolute inset-0 -z-10 hidden lg:block"
          style={{
            background:
              'linear-gradient(90deg, #f7f4ef 0%, #f7f4ef 30%, rgba(247,244,239,.96) 39%, rgba(247,244,239,.72) 49%, rgba(247,244,239,.16) 67%, rgba(247,244,239,0) 82%)',
          }}
        />
        <div
          className="absolute inset-0 -z-10 lg:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(247,244,239,.80) 0%, rgba(247,244,239,.94) 45%, #f7f4ef 75%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#f7f4ef] to-transparent" />

        <div className="mx-auto flex h-full min-h-[680px] max-w-[1240px] items-center px-5 py-14 sm:px-8 lg:min-h-[620px] lg:py-10">
          <div className="w-full max-w-[650px] pt-8 lg:pt-0">
            <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#65000b]">
              Academy management, connected
            </p>
            <h1 className="text-[clamp(3rem,5.2vw,5.25rem)] font-extrabold leading-[.94] tracking-[-.06em]">
              Every learner.<br />One clear journey.
            </h1>
            <p className="mt-6 max-w-[580px] text-base font-medium leading-7 text-[#514b47] sm:text-lg sm:leading-8">
              Applications, cohorts, attendance and progress in one dependable workspace—so the Academy team can see who is moving and who needs support.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#65000b] px-7 text-[15px] font-extrabold text-white shadow-[0_18px_40px_-22px_rgba(101,0,11,.8)] transition hover:bg-[#470008]">
                Open your workspace <MoveRight className="h-[18px] w-[18px]" aria-hidden="true" />
              </Link>
              <Link href="/apply" className="inline-flex h-14 items-center rounded-full border border-[#191716]/20 bg-[#f7f4ef]/75 px-6 text-[15px] font-extrabold text-[#191716] backdrop-blur-sm transition hover:border-[#65000b]/40 hover:text-[#65000b]">
                Apply to join
              </Link>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#625c57]">
                <Check className="h-4 w-4 text-[#0f766e]" aria-hidden="true" /> Built around the learner journey
              </span>
            </div>

            <ol className="mt-11 grid max-w-[580px] grid-cols-4 border-y border-[#191716]/15 bg-[#f7f4ef]/55 py-4 backdrop-blur-[2px]">
              {journey.map((step, index) => (
                <li key={step} className="border-l border-[#191716]/12 px-3 first:border-l-0 first:pl-0 sm:px-5 sm:first:pl-0">
                  <span className="block font-mono text-[10px] text-[#65000b]/65">0{index + 1}</span>
                  <span className="mt-1 block text-xs font-extrabold sm:text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-t border-[#191716]/10 bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-px bg-[#191716]/10 sm:grid-cols-3">
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
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-5 sm:flex-row">
          <FullAcademyLogo className="w-[112px]" />
          <p className="text-center text-xs font-semibold text-[#817a75] sm:text-right">
            Pivosoft Technology Academy<br />Learn. Build. Innovate. Progress.
          </p>
        </div>
      </footer>
    </main>
  );
}
