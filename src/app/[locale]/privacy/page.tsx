import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Privacy Policy — SpinWheel',
  description: 'Privacy Policy for SpinWheel random name and decision picker.',
};

export default async function PrivacyPage({
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
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Privacy Policy</h1>
        <p className="mt-2 text-xs text-slate-400">Last updated: November 2026</p>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
          <p>
            <strong>1. 100% Client-Side Processing:</strong> SpinWheel operates entirely inside your
            web browser. Names, lists, and custom entries you type into the wheel are never uploaded
            to or stored on our servers. When you generate a shareable link, your list is compressed
            directly inside the URL.
          </p>
          <p>
            <strong>2. Cookies &amp; Google AdSense:</strong> We use third-party advertising partners,
            including Google AdSense, to display ads. Google and its partners may use cookies to
            serve ads based on your prior visits to this or other websites. You may opt out of
            personalized advertising by visiting{' '}
            <a
              href="https://myadcenter.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 underline"
            >
              Google My Ad Center
            </a>
            .
          </p>
          <p>
            <strong>3. Analytics:</strong> We may use privacy-friendly, cookieless analytics to
            understand general traffic trends and improve website performance.
          </p>
          <p>
            <strong>4. Contact:</strong> If you have any privacy questions, please reach out via our
            Contact page.
          </p>
        </div>
      </div>
    </main>
  );
}