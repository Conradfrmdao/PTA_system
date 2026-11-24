export function WorkspaceHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-[#191716]/10 pb-7 sm:flex-row sm:items-end">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#65000b]">{eyebrow}</p>
        <h1 className="mt-2 text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-none tracking-[-.05em]">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#6f6965]">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[26px] border border-dashed border-[#191716]/20 bg-white/60 px-6 py-16 text-center text-sm font-semibold text-[#817a75]">{children}</div>;
}

export function StatusPill({ value }: { value: string }) {
  const risk = value === 'REJECTED' || value === 'AT_RISK' || value === 'ABSENT';
  const good = value === 'ACCEPTED' || value === 'ON_TRACK' || value === 'PRESENT' || value === 'ACTIVE';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] ${risk ? 'bg-red-50 text-red-700' : good ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{value.replaceAll('_', ' ')}</span>;
}
