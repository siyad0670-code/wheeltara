import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'About — SpinWheel',
  description: 'Learn about SpinWheel, a fast, free, privacy-first random picker.',
};

export default async function AboutPage({
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
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">About SpinWheel</h1>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
          <p>
            SpinWheel is a fast, free, no-signup random wheel and decision picker built for
            classrooms, giveaways, team activities, and everyday choices.
          </p>
          <p>
            Unlike bloated tools that require accounts or slow down mobile devices, SpinWheel runs
            100% inside your browser using fair cryptographic randomization, supports instant
            elimination mode, shareable URLs, and ad-free classroom embeds.
          </p>
        </div>
      </div>
    </main>
  );
}