'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  }));
  useEffect(() => {
    let active = true;
    const restore = async () => {
      const { accessToken, setSession, clearSession, setRestoring } = useAuthStore.getState();
      try {
        if (accessToken) {
          const user = await authApi.me();
          if (active) setSession(user, accessToken);
          return;
        }
        const session = await authApi.refresh();
        if (active) setSession(session.user, session.accessToken);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setRestoring(false);
      }
    };
    void restore();
    return () => { active = false; };
  }, []); // Session restoration must run only once on app load.

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
