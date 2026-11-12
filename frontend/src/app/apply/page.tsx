'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AcademyMark } from '@/components/brand/academy-mark';
import { applicationsApi, type ApplicationInput } from '@/lib/api/applications';
import { getApiError } from '@/lib/api/client';

const inputClass = 'mt-2 h-13 w-full rounded-2xl border border-[#191716]/15 bg-white px-4 text-sm font-semibold outline-none transition placeholder:text-[#9b948e] focus:border-[#65000b] focus:ring-4 focus:ring-[#65000b]/[.07]';

export default function ApplyPage() {
  const { data: programs = [], isLoading: loadingPrograms } = useQuery({ queryKey: ['public-programs'], queryFn: applicationsApi.programs });
  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationInput>();
  const application = useMutation({
    mutationFn: applicationsApi.submit,
    onError: (error) => toast.error(getApiError(error).message),
  });

  if (application.data) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f7f4ef] px-5 py-12 text-[#191716]">
        <section className="w-full max-w-[650px] rounded-[34px] border border-[#191716]/10 bg-white p-7 shadow-[0_30px_80px_-55px_rgba(25,23,22,.55)] sm:p-12">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#0f766e] text-white"><Check className="h-6 w-6" /></span>
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[.17em] text-[#65000b]">Application received</p>
          <h1 className="mt-3 text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[.95] tracking-[-.055em]">You have taken the first step.</h1>
          <p className="mt-6 max-w-lg text-base font-medium leading-7 text-[#625c57]">
            Thank you, {application.data.applicantName}. Your application for <strong className="text-[#191716]">{application.data.program.name}</strong> is now with the Academy team.
          </p>
          <div className="mt-8 rounded-2xl bg-[#f7f4ef] px-5 py-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#817a75]">Reference</p>
            <p className="mt-1 break-all font-mono text-sm font-bold">{application.data.id}</p>
          </div>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-[#65000b]"><ArrowLeft className="h-4 w-4" /> Return home</Link>
        </section>
      </main>
    );
  }

  const onSubmit = (data: ApplicationInput) => application.mutate({ ...data, phone: data.phone || undefined });

  return (
    <main className="min-h-dvh bg-[#f7f4ef] text-[#191716]">
      <header className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <AcademyMark />
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#625c57] hover:text-[#65000b]"><ArrowLeft className="h-4 w-4" /> Back home</Link>
      </header>
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 pb-16 pt-7 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:pt-14">
        <section className="lg:pt-7">
          <p className="text-xs font-extrabold uppercase tracking-[.17em] text-[#65000b]">Apply to Pivosoft Technology Academy</p>
          <h1 className="mt-4 text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-[.92] tracking-[-.06em]">Start with what matters.</h1>
          <p className="mt-6 max-w-md text-base font-medium leading-7 text-[#625c57]">Tell us who you are and which programme you want to join. The Academy team will review your application and contact you about the next step.</p>
          <ol className="mt-10 space-y-4 border-l border-[#65000b]/20 pl-6 text-sm font-bold">
            <li><span className="mr-3 font-mono text-[10px] text-[#65000b]">01</span> Submit your details</li>
            <li><span className="mr-3 font-mono text-[10px] text-[#65000b]">02</span> Academy review</li>
            <li><span className="mr-3 font-mono text-[10px] text-[#65000b]">03</span> Receive your decision</li>
          </ol>
        </section>

        <section className="rounded-[32px] border border-[#191716]/10 bg-white p-6 shadow-[0_30px_80px_-55px_rgba(25,23,22,.5)] sm:p-9">
          <div className="border-b border-[#191716]/10 pb-6">
            <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#817a75]">Learner application</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-.035em]">Your details</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold">First name
              <input {...register('firstName', { required: 'First name is required', minLength: 2 })} className={inputClass} placeholder="Amina" />
              {errors.firstName && <span className="mt-1 block text-xs text-red-700">{errors.firstName.message}</span>}
            </label>
            <label className="text-sm font-bold">Last name
              <input {...register('lastName', { required: 'Last name is required', minLength: 2 })} className={inputClass} placeholder="Nabirye" />
              {errors.lastName && <span className="mt-1 block text-xs text-red-700">{errors.lastName.message}</span>}
            </label>
            <label className="text-sm font-bold sm:col-span-2">Email address
              <input type="email" {...register('email', { required: 'Email is required' })} className={inputClass} placeholder="you@example.com" />
              {errors.email && <span className="mt-1 block text-xs text-red-700">{errors.email.message}</span>}
            </label>
            <label className="text-sm font-bold sm:col-span-2">Phone number <span className="font-medium text-[#817a75]">(optional)</span>
              <input type="tel" {...register('phone')} className={inputClass} placeholder="+256 700 000000" />
            </label>
            <label className="text-sm font-bold sm:col-span-2">Programme
              <select {...register('programId', { required: 'Choose a programme' })} disabled={loadingPrograms} className={inputClass} defaultValue="">
                <option value="" disabled>{loadingPrograms ? 'Loading programmes…' : 'Select a programme'}</option>
                {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
              </select>
              {errors.programId && <span className="mt-1 block text-xs text-red-700">{errors.programId.message}</span>}
            </label>
            <button disabled={application.isPending || loadingPrograms} className="mt-2 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#65000b] px-7 text-sm font-extrabold text-white transition hover:bg-[#470008] disabled:opacity-60 sm:col-span-2">
              {application.isPending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <>Submit application <ArrowRight className="h-4 w-4" /></>}
            </button>
            <p className="text-center text-[11px] font-medium leading-5 text-[#817a75] sm:col-span-2">By submitting, you confirm that the information provided is accurate.</p>
          </form>
        </section>
      </div>
    </main>
  );
}
