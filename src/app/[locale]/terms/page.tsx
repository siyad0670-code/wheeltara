import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Terms of Service — SpinWheel',
  description: 'Terms of Service for using SpinWheel free random picker tools.',
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Terms of Service</h1>
        <p className="mt-2 text-xs text-slate-400">Last updated: November 2026</p>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
          <p>
            <strong>1. Free Utility Use:</strong> SpinWheel provides free browser-based random
            decision and classroom picker tools for personal, educational, and commercial event use.
          </p>
          <p>
            <strong>2. Fairness &amp; No Warranty:</strong> Results are generated locally using your
            browser&apos;s cryptographic random generator (crypto.getRandomValues). The service is
            provided &quot;as is&quot; without warranties of any kind.
          </p>
          <p>
            <strong>3. Acceptable Use:</strong> You are responsible for any content you enter or
            share via custom wheel links and embeds. Do not use the tool for illegal raffles or
            prohibited activities in your jurisdiction.
          </p>
        </div>
      </div>
    </main>
  );
}