import Image from 'next/image';
import { cn } from '@/lib/utils';

export function AcademyMark({ inverse = false, compact = false, className }: {
  inverse?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <span className={cn(
        'grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border p-1.5',
        inverse ? 'border-white/20 bg-white' : 'border-[#65000b]/10 bg-white',
      )}>
        <Image
          src="/brand/pivosoft-academy-mark.png"
          alt=""
          width={44}
          height={44}
          className="h-full w-full object-contain"
          priority
        />
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

export function FullAcademyLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/pivosoft-academy-logo.png"
      alt="Pivosoft Technology Academy"
      width={180}
      height={180}
      className={cn('h-auto w-[150px] object-contain', className)}
      priority
    />
  );
}
