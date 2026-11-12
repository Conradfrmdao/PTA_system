import { ArrowLeft, LockKeyhole } from 'lucide-react';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f4ef] px-5">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-[#65000b] text-white"><LockKeyhole className="h-7 w-7" /></span>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[.17em] text-[#65000b]">Access restricted</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-.04em]">This workspace is not assigned to your role.</h1>
        <p className="mt-4 text-sm font-medium leading-6 text-[#6f6965]">Your account is active, but this area belongs to a different Academy role.</p>
        <Link href="/dashboard" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-[#191716] px-6 text-sm font-extrabold text-white">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </div>
    </main>
  );
}
