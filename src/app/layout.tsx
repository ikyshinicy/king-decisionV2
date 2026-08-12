import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Manrope, Fraunces } from 'next/font/google';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'KING DECISION — Brainstorming Bersama Tiga Menteri AI',
  description:
    'Ruang sidang pribadi di mana Raja berdiskusi dengan tiga menteri AI — Gemini, Claude, dan GPT — untuk menemukan keputusan terbaik.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className={manrope.className}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
</body>
    </html>
  );
}