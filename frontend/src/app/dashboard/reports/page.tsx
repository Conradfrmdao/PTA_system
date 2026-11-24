'use client';

import { useQuery } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { StatusPill, WorkspaceHeader } from '@/components/dashboard/workspace-ui';
import { workspaceApi } from '@/lib/api/workspace';

const count = (items: { status: string; _count: number }[] | undefined, status: string) => items?.find((item) => item.status === status)?._count ?? 0;
export default function ReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['report'], queryFn: workspaceApi.report });
  if (isLoading || !data) return <main className="grid min-h-[60vh] place-items-center"><LoaderCircle className="animate-spin text-[#65000b]" /></main>;
  const attendanceTotal = data.attendanceStatus.reduce((sum, item) => sum + item._count, 0); const present = count(data.attendanceStatus, 'PRESENT') + count(data.attendanceStatus, 'LATE');
  const cards = [['Applications', data.applicationStatus.reduce((sum, item) => sum + item._count, 0), `${count(data.applicationStatus, 'SUBMITTED')} awaiting review`], ['Active learners', count(data.learnerStatus, 'ACTIVE'), `${data.cohorts.length} cohorts`], ['Attendance rate', attendanceTotal ? `${Math.round(present / attendanceTotal * 100)}%` : '—', `${attendanceTotal} records`], ['Learners at risk', (data.progressStatus.AT_RISK ?? 0) + (data.progressStatus.NEEDS_ATTENTION ?? 0), 'Latest progress signals']];
  return <main className="px-5 pb-12 pt-7 sm:px-8 lg:px-10 xl:px-14"><WorkspaceHeader eyebrow="Academy intelligence" title="Reports" description="A live operational view built from applications, enrollment, attendance and learner progress." /><section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, detail]) => <article key={label} className="rounded-[24px] border border-[#191716]/10 bg-white p-5"><p className="text-xs font-bold text-[#817a75]">{label}</p><strong className="mt-3 block text-4xl tracking-[-.05em]">{value}</strong><p className="mt-2 text-xs font-semibold text-[#65000b]">{detail}</p></article>)}</section><section className="mt-6 overflow-hidden rounded-[26px] border border-[#191716]/10 bg-white"><div className="border-b border-[#191716]/10 px-5 py-4"><h2 className="font-extrabold">Latest learner progress</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="bg-[#f7f4ef] text-[10px] uppercase tracking-[.12em] text-[#817a75]"><tr><th className="px-5 py-4">Learner</th><th>Programme</th><th>Score</th><th>Status</th></tr></thead><tbody className="divide-y divide-[#191716]/8">{data.learners.map((item, index) => <tr key={`${item.learner.user.firstName}-${index}`} className="text-sm"><td className="px-5 py-4 font-bold">{item.learner.user.firstName} {item.learner.user.lastName}</td><td>{item.learner.program.name}</td><td className="font-extrabold">{item.overallScore}%</td><td><StatusPill value={item.status} /></td></tr>)}</tbody></table></div></section></main>;
}
