import { cn } from '@/lib/utils';

export function AcademyMark({ inverse = false, compact = false, className }: {
  inverse?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <span className={cn(
        'grid h-10 w-10 place-items-center rounded-[14px] border text-[12px] font-extrabold tracking-[-0.04em]',
        inverse ? 'border-white/25 bg-white text-[#65000b]' : 'border-[#65000b]/15 bg-[#65000b] text-white',
      )}>
        PTA
      </span>
      {!compact && (
        <span className="leading-[1.05]">
          <span className={cn('block text-[14px] font-extrabold tracking-[-0.02em]', inverse ? 'text-white' : 'text-[#191716]')}>
            Pivosoft Technology
          </span>
          <span className={cn('block text-[12px] font-semibold', inverse ? 'text-white/60' : 'text-[#6f6965]')}>
            Academy
          </span>
        </span>
      )}
    </div>
  );
}
