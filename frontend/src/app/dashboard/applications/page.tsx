'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Check, Copy, LoaderCircle, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EmptyState, StatusPill, WorkspaceHeader } from '@/components/dashboard/workspace-ui';
import { getApiError } from '@/lib/api/client';
import { workspaceApi, type Application } from '@/lib/api/workspace';

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [reviewing, setReviewing] = useState<Application | null>(null);
  const [cohortId, setCohortId] = useState('');
  const [note, setNote] = useState('');
  const [invitation, setInvitation] = useState<{ email: string; setupUrl: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['applications', status], queryFn: () => workspaceApi.applications(status || undefined) });
  const { data: cohorts = [] } = useQuery({ queryKey: ['cohorts'], queryFn: workspaceApi.cohorts });
  const review = useMutation({
    mutationFn: ({ decision }: { decision: string }) => workspaceApi.reviewApplication(reviewing!.id, { status: decision, reviewNote: note || undefined, cohortId: decision === 'ACCEPTED' && cohortId ? cohortId : undefined }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      const acceptedEmail = reviewing?.email;
      setReviewing(null); setNote(''); setCohortId('');
      if (result.setupUrl && result.expiresAt && acceptedEmail) setInvitation({ email: acceptedEmail, setupUrl: result.setupUrl, expiresAt: result.expiresAt });
      else toast.success('Application updated');
    },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const reissue = useMutation({
    mutationFn: workspaceApi.reissueInvitation,
    onSuccess: (result) => setInvitation(result),
    onError: (error) => toast.error(getApiError(error).message),
  });
  const copyInvitation = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const eligibleCohorts = cohorts.filter((cohort) => cohort.program.id === reviewing?.program.id);

  return (
    <main className="px-5 pb-12 pt-7 sm:px-8 lg:px-10 xl:px-14">
      <WorkspaceHeader eyebrow="Admissions" title="Applications" description="Review every prospective learner, record a decision, and create accepted learner accounts without re-entering their details." />
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {['', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'WAITLISTED', 'REJECTED'].map((value) => <button key={value} onClick={() => setStatus(value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold ${status === value ? 'bg-[#65000b] text-white' : 'border border-[#191716]/10 bg-white text-[#625c57]'}`}>{value ? value.replaceAll('_', ' ') : 'ALL'}</button>)}
      </div>
      <section className="mt-5 overflow-hidden rounded-[26px] border border-[#191716]/10 bg-white">
        {isLoading ? <div className="grid h-48 place-items-center"><LoaderCircle className="h-6 w-6 animate-spin text-[#65000b]" /></div> : !data?.items.length ? <EmptyState>No applications in this view.</EmptyState> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f7f4ef] text-[10px] uppercase tracking-[.12em] text-[#817a75]"><tr><th className="px-5 py-4">Applicant</th><th>Programme</th><th>Submitted</th><th>Status</th><th className="px-5 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#191716]/8">{data.items.map((item) => <tr key={item.id} className="text-sm"><td className="px-5 py-4"><strong className="block">{item.firstName} {item.lastName}</strong><span className="text-xs text-[#817a75]">{item.email}</span></td><td>{item.program.name}</td><td>{format(new Date(item.createdAt), 'd MMM yyyy')}</td><td><StatusPill value={item.status} /></td><td className="px-5 text-right">{item.status === 'ACCEPTED' ? item.acceptedLearner ? <span className="text-xs font-bold text-[#817a75]">Registered</span> : <button onClick={() => reissue.mutate(item.id)} disabled={reissue.isPending} className="text-xs font-extrabold text-[#65000b]">New registration link</button> : <button onClick={() => setReviewing(item)} className="text-xs font-extrabold text-[#65000b]">Review</button>}</td></tr>)}</tbody></table></div>
        )}
      </section>
      {reviewing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5 backdrop-blur-sm" onClick={() => setReviewing(null)}><section className="w-full max-w-lg rounded-[28px] bg-white p-6 sm:p-8" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#65000b]">Review application</p><h2 className="mt-2 text-2xl font-extrabold">{reviewing.firstName} {reviewing.lastName}</h2></div><button onClick={() => setReviewing(null)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f7f4ef]"><X className="h-4 w-4" /></button></div><p className="mt-2 text-sm text-[#6f6965]">{reviewing.program.name} · {reviewing.email}</p><label className="mt-6 block text-sm font-bold">Review note<textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-[#191716]/15 p-4 outline-none focus:border-[#65000b]" /></label><label className="mt-4 block text-sm font-bold">Cohort for accepted learner<select value={cohortId} onChange={(event) => setCohortId(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#191716]/15 bg-white px-4"><option value="">Assign later</option>{eligibleCohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</select></label><div className="mt-7 grid grid-cols-2 gap-3"><button onClick={() => review.mutate({ decision: 'REJECTED' })} disabled={review.isPending} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-red-200 text-sm font-extrabold text-red-700"><X className="h-4 w-4" /> Reject</button><button onClick={() => review.mutate({ decision: 'ACCEPTED' })} disabled={review.isPending} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#65000b] text-sm font-extrabold text-white">{review.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Accept</button></div></section></div>}
      {invitation && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5 backdrop-blur-sm" onClick={() => setInvitation(null)}><section className="w-full max-w-lg rounded-[28px] bg-white p-6 sm:p-8" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#0f766e]">Application accepted</p><h2 className="mt-2 text-2xl font-extrabold">Registration link ready</h2></div><button onClick={() => setInvitation(null)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f7f4ef]"><X className="h-4 w-4" /></button></div><p className="mt-3 text-sm font-medium leading-6 text-[#6f6965]">Share this secure link with <strong>{invitation.email}</strong>. The learner will confirm their details and create their own password.</p><div className="mt-6 rounded-2xl border border-[#65000b]/15 bg-[#65000b]/[.05] p-4"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#65000b]">Registration link</p><div className="mt-2 flex items-center justify-between gap-3"><code className="max-h-20 overflow-auto break-all text-xs font-bold leading-5">{invitation.setupUrl}</code><button onClick={() => void copyInvitation(invitation.setupUrl)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#65000b]" aria-label="Copy registration link">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div></div><p className="mt-3 text-xs font-semibold text-[#817a75]">Expires {format(new Date(invitation.expiresAt), 'd MMM yyyy, h:mm a')}</p><button onClick={() => setInvitation(null)} className="mt-7 h-12 w-full rounded-full bg-[#191716] text-sm font-extrabold text-white">I have copied the link</button></section></div>}
    </main>
  );
}
