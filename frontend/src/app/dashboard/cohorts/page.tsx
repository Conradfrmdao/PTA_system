'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { LoaderCircle, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { EmptyState, StatusPill, WorkspaceHeader } from '@/components/dashboard/workspace-ui';
import { applicationsApi, type PublicProgram } from '@/lib/api/applications';
import { getApiError } from '@/lib/api/client';
import { workspaceApi } from '@/lib/api/workspace';

type Form = { name: string; programId: string; startDate: string; endDate: string };
export default function CohortsPage() {
  const [open, setOpen] = useState(false); const queryClient = useQueryClient(); const { register, handleSubmit, reset } = useForm<Form>();
  const { data: cohorts = [], isLoading } = useQuery({ queryKey: ['cohorts'], queryFn: workspaceApi.cohorts });
  const { data: programs = [] as PublicProgram[] } = useQuery({ queryKey: ['public-programs'], queryFn: applicationsApi.programs });
  const create = useMutation({ mutationFn: workspaceApi.createCohort, onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['cohorts'] }); setOpen(false); reset(); toast.success('Cohort created'); }, onError: (error) => toast.error(getApiError(error).message) });
  return <main className="px-5 pb-12 pt-7 sm:px-8 lg:px-10 xl:px-14"><WorkspaceHeader eyebrow="Academy structure" title="Cohorts" description="Create delivery groups, see enrollment at a glance, and keep dates and ownership clear." action={<button onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#65000b] px-5 text-sm font-extrabold text-white"><Plus className="h-4 w-4" /> New cohort</button>} /><section className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{isLoading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : !cohorts.length ? <EmptyState>No cohorts created yet.</EmptyState> : cohorts.map((cohort) => <article key={cohort.id} className="rounded-[26px] border border-[#191716]/10 bg-white p-6"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#65000b]/[.07] text-[#65000b]"><Users className="h-5 w-5" /></span><StatusPill value={cohort.status} /></div><h2 className="mt-6 text-xl font-extrabold">{cohort.name}</h2><p className="mt-1 text-sm font-semibold text-[#6f6965]">{cohort.program.name}</p><div className="mt-6 grid grid-cols-2 border-t border-[#191716]/10 pt-5 text-xs"><div><span className="block text-[#817a75]">Dates</span><strong className="mt-1 block">{format(new Date(cohort.startDate), 'd MMM')} – {format(new Date(cohort.endDate), 'd MMM yy')}</strong></div><div><span className="block text-[#817a75]">Learners</span><strong className="mt-1 block">{cohort._count?.enrollments ?? 0}</strong></div></div></article>)}</section>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5" onClick={() => setOpen(false)}><form onSubmit={handleSubmit((data) => create.mutate(data))} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-[28px] bg-white p-7"><h2 className="text-2xl font-extrabold">Create cohort</h2><div className="mt-6 grid gap-4"><input {...register('name', { required: true })} placeholder="Cohort name" className="h-12 rounded-2xl border px-4" /><select {...register('programId', { required: true })} className="h-12 rounded-2xl border bg-white px-4"><option value="">Select programme</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select><label className="text-xs font-bold">Start date<input type="date" {...register('startDate', { required: true })} className="mt-2 h-12 w-full rounded-2xl border px-4" /></label><label className="text-xs font-bold">End date<input type="date" {...register('endDate', { required: true })} className="mt-2 h-12 w-full rounded-2xl border px-4" /></label><button className="mt-2 h-12 rounded-full bg-[#65000b] font-extrabold text-white">{create.isPending ? 'Creating…' : 'Create cohort'}</button></div></form></div>}</main>;
}
