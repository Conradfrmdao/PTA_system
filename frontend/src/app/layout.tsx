import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: { default: 'PTA System', template: '%s | PTA System' },
  description: 'Learner operations for Pivosoft Technology Academy.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
