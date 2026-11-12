'use client';

import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell } from '@/components/dashboard/app-shell';
import { useAuthStore } from '@/stores/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isRestoring } = useAuthStore();

  useEffect(() => {
    if (!isRestoring && !user) router.replace('/login');
  }, [isRestoring, router, user]);

  if (isRestoring || !user) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f7f4ef]">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-[#65000b]" />
          <p className="mt-3 text-xs font-bold text-[#6f6965]">Opening your workspace</p>
        </div>
      </main>
    );
  }

  return <AppShell>{children}</AppShell>;
}
