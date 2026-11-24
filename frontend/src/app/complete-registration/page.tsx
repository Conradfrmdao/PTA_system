'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AcademyMark } from '@/components/brand/academy-mark';
import { getApiError } from '@/lib/api/client';
import { registrationsApi, type CompleteRegistrationInput } from '@/lib/api/registrations';

const fieldClass = 'mt-2 h-13 w-full rounded-2xl border border-[#191716]/15 bg-white px-4 text-sm font-semibold outline-none transition placeholder:text-[#9b948e] focus:border-[#65000b] focus:ring-4 focus:ring-[#65000b]/[.07]';

function RegistrationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CompleteRegistrationInput>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['registration-invitation', token],
    queryFn: () => registrationsApi.invitation(token),
    enabled: Boolean(token),
    retry: false,
  });
  const completion = useMutation({
    mutationFn: (input: CompleteRegistrationInput) => registrationsApi.complete(token, input),
    onError: (requestError) => toast.error(getApiError(requestError).message),
  });

  if (isLoading) return <main className="grid min-h-dvh place-items-center bg-[#f7f4ef]"><LoaderCircle className="h-7 w-7 animate-spin text-[#65000b]" /></main>;
  if (!token || error || !data) return <main className="grid min-h-dvh place-items-center bg-[#f7f4ef] px-5"><section className="max-w-lg rounded-[30px] border border-[#191716]/10 bg-white p-8 text-center"><h1 className="text-3xl font-extrabold">This registration link is unavailable.</h1><p className="mt-4 text-sm font-medium leading-6 text-[#6f6965]">It may be invalid or expired. Contact the Academy team for a new registration link.</p><Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#65000b]"><ArrowLeft className="h-4 w-4" /> Back to home</Link></section></main>;
  if (completion.data) return <main className="grid min-h-dvh place-items-center bg-[#f7f4ef] px-5"><section className="w-full max-w-xl rounded-[32px] border border-[#191716]/10 bg-white p-8 sm:p-12"><span className="grid h-14 w-14 place-items-center rounded-full bg-[#0f766e] text-white"><Check className="h-6 w-6" /></span><p className="mt-8 text-xs font-extrabold uppercase tracking-[.16em] text-[#65000b]">Account created</p><h1 className="mt-3 text-[clamp(2.6rem,7vw,4.5rem)] font-extrabold leading-[.95] tracking-[-.055em]">Welcome to the Academy.</h1><p className="mt-5 text-base font-medium leading-7 text-[#625c57]">Your learner account is ready. Sign in using <strong className="text-[#191716]">{completion.data.email}</strong> and the password you just created.</p><Link href="/login" className="mt-8 inline-flex h-13 items-center gap-3 rounded-full bg-[#65000b] px-7 text-sm font-extrabold text-white">Go to sign in <ArrowRight className="h-4 w-4" /></Link></section></main>;

  const onSubmit = (input: CompleteRegistrationInput) => completion.mutate(input);
  return (
    <main className="min-h-dvh bg-[#f7f4ef] text-[#191716]">
      <header className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 sm:px-8"><AcademyMark /><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#625c57] hover:text-[#65000b]"><ArrowLeft className="h-4 w-4" /> Back to home</Link></header>
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 pb-16 pt-7 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:pt-12">
        <section className="lg:pt-7"><p className="text-xs font-extrabold uppercase tracking-[.17em] text-[#65000b]">Complete your registration</p><h1 className="mt-4 text-[clamp(3rem,6vw,5.4rem)] font-extrabold leading-[.92] tracking-[-.06em]">Create your learner account.</h1><p className="mt-6 max-w-md text-base font-medium leading-7 text-[#625c57]">Your application has been accepted. Confirm the approved details, add your learner profile information, and choose a private password.</p><div className="mt-9 flex items-center gap-3 rounded-2xl border border-[#0f766e]/15 bg-[#0f766e]/[.06] p-4 text-sm font-bold text-[#0f5f58]"><ShieldCheck className="h-5 w-5 shrink-0" /> This secure link expires after seven days.</div></section>
        <section className="rounded-[32px] border border-[#191716]/10 bg-white p-6 shadow-[0_30px_80px_-55px_rgba(25,23,22,.5)] sm:p-9">
          <div className="grid gap-3 rounded-2xl bg-[#f7f4ef] p-5 sm:grid-cols-2"><div><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#817a75]">Learner</p><p className="mt-1 text-sm font-extrabold">{data.firstName} {data.lastName}</p></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#817a75]">Email</p><p className="mt-1 break-all text-sm font-extrabold">{data.email}</p></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#817a75]">Programme</p><p className="mt-1 text-sm font-extrabold">{data.program.name}</p></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#817a75]">Cohort</p><p className="mt-1 text-sm font-extrabold">{data.cohort?.name ?? 'To be assigned'}</p></div></div>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold sm:col-span-2">Date of birth<input type="date" {...register('dateOfBirth', { required: 'Date of birth is required' })} className={fieldClass} />{errors.dateOfBirth && <span className="mt-1 block text-xs text-red-700">{errors.dateOfBirth.message}</span>}</label>
            <label className="text-sm font-bold sm:col-span-2">Education background <span className="font-medium text-[#817a75]">(optional)</span><input {...register('educationBackground')} className={fieldClass} placeholder="For example: Diploma in Information Technology" /></label>
            <label className="text-sm font-bold sm:col-span-2">Previous school or institution <span className="font-medium text-[#817a75]">(optional)</span><input {...register('previousInstitution')} className={fieldClass} placeholder="Institution name" /></label>
            <label className="text-sm font-bold">Create password<input type="password" autoComplete="new-password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} className={fieldClass} />{errors.password && <span className="mt-1 block text-xs text-red-700">{errors.password.message}</span>}</label>
            <label className="text-sm font-bold">Confirm password<input type="password" autoComplete="new-password" {...register('confirmPassword', { required: 'Confirm your password', validate: (value) => value === watch('password') || 'Passwords do not match' })} className={fieldClass} />{errors.confirmPassword && <span className="mt-1 block text-xs text-red-700">{errors.confirmPassword.message}</span>}</label>
            <button disabled={completion.isPending} className="mt-2 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#65000b] px-7 text-sm font-extrabold text-white transition hover:bg-[#470008] disabled:opacity-60 sm:col-span-2">{completion.isPending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <>Create my account <ArrowRight className="h-4 w-4" /></>}</button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function CompleteRegistrationPage() {
  return <Suspense fallback={<main className="grid min-h-dvh place-items-center bg-[#f7f4ef]"><LoaderCircle className="h-7 w-7 animate-spin text-[#65000b]" /></main>}><RegistrationForm /></Suspense>;
}
