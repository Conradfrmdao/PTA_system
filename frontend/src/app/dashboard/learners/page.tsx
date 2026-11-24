'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EmptyState, StatusPill, WorkspaceHeader } from '@/components/dashboard/workspace-ui';
import { getApiError } from '@/lib/api/client';
import { workspaceApi } from '@/lib/api/workspace';
import { useAuthStore } from '@/stores/auth';

export default function LearnersPage() {
  const role = useAuthStore((state) => state.user!.role);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { data: learners = [], isLoading } = useQuery({ queryKey: ['learners'], queryFn: () => workspaceApi.learners() });
  const { data: cohorts = [] } = useQuery({ queryKey: ['cohorts'], queryFn: workspaceApi.cohorts });
  const assign = useMutation({ mutationFn: ({ learnerId, cohortId }: { learnerId: string; cohortId: string }) => workspaceApi.assignCohort(learnerId, cohortId), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['learners'] }); toast.success('Cohort assignment updated'); }, onError: (error) => toast.error(getApiError(error).message) });
  const filtered = useMemo(() => learners.filter((learner) => `${learner.user.firstName} ${learner.user.lastName} ${learner.user.email}`.toLowerCase().includes(search.toLowerCase())), [learners, search]);
  return <main className="px-5 pb-12 pt-7 sm:px-8 lg:px-10 xl:px-14"><WorkspaceHeader eyebrow="Learner records" title={role === 'ADMIN' ? 'Learners' : 'My learners'} description="A current view of learner identity, programme, cohort and the latest progress signal." action={<label className="flex h-11 items-center gap-2 rounded-full border border-[#191716]/10 bg-white px-4"><Search className="h-4 w-4 text-[#817a75]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search learners" className="w-40 bg-transparent text-sm outline-none" /></label>} /><section className="mt-7 overflow-hidden rounded-[26px] border border-[#191716]/10 bg-white">{isLoading ? <div className="grid h-48 place-items-center"><LoaderCircle className="h-6 w-6 animate-spin" /></div> : !filtered.length ? <EmptyState>No learners found.</EmptyState> : <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead className="bg-[#f7f4ef] text-[10px] uppercase tracking-[.12em] text-[#817a75]"><tr><th className="px-5 py-4">Learner</th><th>Programme</th><th>Cohort</th><th>Progress</th><th>Status</th></tr></thead><tbody className="divide-y divide-[#191716]/8">{filtered.map((learner) => { const current = learner.cohortEnrollments[0]?.cohort; const progress = learner.progressSnapshots[0]; return <tr key={learner.id} className="text-sm"><td className="px-5 py-4"><strong className="block">{learner.user.firstName} {learner.user.lastName}</strong><span className="text-xs text-[#817a75]">{learner.user.email}</span></td><td>{learner.program.name}</td><td>{role === 'ADMIN' ? <select value={current?.id ?? ''} onChange={(event) => event.target.value && assign.mutate({ learnerId: learner.id, cohortId: event.target.value })} className="h-9 rounded-xl border border-[#191716]/10 bg-white px-3 text-xs font-bold"><option value="">Unassigned</option>{cohorts.filter((cohort) => cohort.program.id === learner.program.id).map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</select> : current?.name ?? 'Unassigned'}</td><td className="font-extrabold">{progress ? `${progress.overallScore}%` : '—'}</td><td><StatusPill value={progress?.status ?? learner.status} /></td></tr>; })}</tbody></table></div>}</section></main>;
}
