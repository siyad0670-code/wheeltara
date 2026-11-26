import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Contact — SpinWheel',
  description: 'Get in touch with the SpinWheel team for feedback or support.',
};

export default async function ContactPage({
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
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Contact Us</h1>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
          <p>
            Have a feature suggestion, bug report, or business inquiry? We would love to hear from
            you.
          </p>
          <p>
            Email us directly at:{' '}
            <a
              href="mailto:contact@wheeltara.com"
              className="font-semibold text-orange-600 underline"
            >
              contact@wheeltara.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}