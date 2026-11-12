'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AcademyMark } from '@/components/brand/academy-mark';
import { authApi } from '@/lib/api/auth';
import { getApiError } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
});
type LoginValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, isRestoring, setSession } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isRestoring && user) router.replace('/dashboard');
  }, [isRestoring, router, user]);

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const session = await authApi.login(values);
      setSession(session.user, session.accessToken);
      router.replace('/dashboard');
    } catch (error) {
      setFormError(getApiError(error).message);
    }
  };

  return (
    <main className="grid min-h-dvh min-w-0 grid-cols-1 overflow-x-hidden bg-white lg:grid-cols-[.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-[#65000b] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <AcademyMark inverse />
        <div className="relative z-[1] max-w-lg">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/55">The learner journey, connected</p>
          <h1 className="mt-5 text-[clamp(3.2rem,5vw,5.6rem)] font-extrabold leading-[.94] tracking-[-.06em]">Know where every learner stands.</h1>
          <p className="mt-7 max-w-md text-[16px] font-medium leading-7 text-white/65">One secure workspace for academy operations, mentorship and learner progress.</p>
        </div>
        <div className="relative z-[1] flex gap-5 text-[11px] font-extrabold uppercase tracking-[.13em] text-white/45">
          <span>Learn</span><span>Build</span><span>Innovate</span><span>Progress</span>
        </div>
        <div aria-hidden="true" className="absolute -bottom-40 -right-36 h-[520px] w-[520px] rounded-full border-[100px] border-white/[.035]" />
      </section>

      <section className="flex min-h-dvh min-w-0 items-center justify-center bg-[#f7f4ef] px-5 py-10 sm:px-8">
        <div className="min-w-0 w-full max-w-[440px]">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <AcademyMark />
            <Link href="/" aria-label="Back to home" className="grid h-10 w-10 place-items-center rounded-full border border-[#191716]/10 bg-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-xs font-extrabold uppercase tracking-[.17em] text-[#65000b]">Welcome back</p>
          <h2 className="mt-3 text-[clamp(2.2rem,6vw,3.2rem)] font-extrabold leading-none tracking-[-.045em]">Sign in to PTA</h2>
          <p className="mt-4 text-[15px] font-medium leading-6 text-[#6f6965]">Use the account provided by the Academy team.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-5" noValidate>
            {formError && (
              <div role="alert" className="rounded-2xl border border-[#b91c1c]/20 bg-[#b91c1c]/[.06] px-4 py-3 text-sm font-semibold text-[#8a1c1c]">
                {formError}
              </div>
            )}

            <label className="block">
              <span className="mb-2 block text-[13px] font-extrabold">Email address</span>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@pivosoftacademy.com"
                aria-invalid={Boolean(errors.email)}
                className="h-14 w-full rounded-2xl border border-[#191716]/15 bg-white px-4 text-[15px] font-semibold outline-none transition placeholder:font-medium placeholder:text-[#9b948f] focus:border-[#65000b] focus:ring-4 focus:ring-[#65000b]/[.08]"
              />
              {errors.email && <span className="mt-2 block text-xs font-semibold text-[#b91c1c]">{errors.email.message}</span>}
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-extrabold">Password</span>
              <span className="relative block">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your password"
                  aria-invalid={Boolean(errors.password)}
                  className="h-14 w-full rounded-2xl border border-[#191716]/15 bg-white px-4 pr-14 text-[15px] font-semibold outline-none transition placeholder:font-medium placeholder:text-[#9b948f] focus:border-[#65000b] focus:ring-4 focus:ring-[#65000b]/[.08]"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-xl text-[#6f6965] hover:bg-[#f7f4ef]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </span>
              {errors.password && <span className="mt-2 block text-xs font-semibold text-[#b91c1c]">{errors.password.message}</span>}
            </label>

            <button disabled={isSubmitting} className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#191716] px-5 text-[15px] font-extrabold text-white transition hover:bg-[#65000b] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? <><LoaderCircle className="h-[18px] w-[18px] animate-spin" /> Signing in</> : <>Continue <ArrowRight className="h-[18px] w-[18px]" /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-xs font-medium leading-5 text-[#817a75]">Need access? Contact your Academy administrator.</p>
        </div>
      </section>
    </main>
  );
}
