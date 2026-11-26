import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { WHEELS } from '@/data/wheels';
import { Link } from '@/i18n/navigation';
import { WheelWorkspace } from '@/components/WheelWorkspace';
import { AdSlot } from '@/components/AdSlot';


type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const WHEEL_ICONS: Record<string, string> = {
  'yes-or-no': '✅',
  'yes-no-maybe': '🤔',
  'what-to-eat': '🍕',
  'classroom-name-picker': '🎓',
  'random-team-generator': '👥',
  'giveaway-winner-picker': '🎁',
  'truth-or-dare': '🔥',
  'random-number-1-100': '💯',
  'random-number-1-10': '🔢',
  'prize-wheel': '🏆',
  'decision-wheel': '🎯',
  'movie-picker': '🎬',
  'chore-wheel': '🧹',
  'random-letter-picker': '🔤',
  'workout-picker': '💪',
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    WHEELS.map((wheel) => ({ locale, slug: wheel.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const wheel = WHEELS.find((w) => w.slug === slug);
  if (!wheel) notFound();

  const t = await getTranslations({ locale, namespace: `Wheels.${slug}` });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/wheel/${slug}/`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `/${l}/wheel/${slug}/`])
        ),
        'x-default': `/en/wheel/${slug}/`,
      },
    },
  };
}

export default async function NicheWheelPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const wheel = WHEELS.find((w) => w.slug === slug);
  if (!wheel) notFound();

  setRequestLocale(locale);

  const tWheel = await getTranslations({ locale, namespace: `Wheels.${slug}` });
  const tUI = await getTranslations({ locale, namespace: 'UI' });
  const messages = (await getMessages()) as {
    Wheels: Record<string, { h1: string; items: string[]; faqs: Array<{ q: string; a: string }> }>;
  };

  const wheelData = messages.Wheels[slug];

  return (
    <main className="mx-auto max-w-6xl px-3 pb-20 pt-3 sm:px-4 sm:py-6">
      <div className="mb-3 text-center sm:mb-6">
        <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-4xl">
          <span className="mr-2">{WHEEL_ICONS[slug] || '🎡'}</span>
          {tWheel('h1')}
        </h1>
        <p className="mx-auto mt-1 text-xs font-medium text-slate-500 sm:text-sm">
          {tWheel('description')}
        </p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-200" />}>
        <WheelWorkspace initialItems={wheelData.items} locale={locale} />
      </Suspense>

      <AdSlot variant="banner" />

      {/* Guide & Collapsible FAQ */}
      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-slate-700">{tWheel('guide')}</p>

        <div className="mt-5 space-y-2">
          {wheelData.faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
                <span>{faq.q}</span>
                <span className="text-orange-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Wheels */}
      <section id="tools" className="mt-10 scroll-mt-20">
        <h2 className="mb-4 text-lg font-extrabold text-slate-900">{tUI('allWheels')}</h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
          {WHEELS.filter((w) => w.slug !== slug).map((other) => (
            <Link
              key={other.slug}
              href={`/wheel/${other.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-orange-400 hover:shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg">
                {WHEEL_ICONS[other.slug] || '🎡'}
              </span>
              <span className="truncate text-sm font-bold text-slate-900">
                {messages.Wheels[other.slug]?.h1}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}