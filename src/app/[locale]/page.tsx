import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { WHEELS } from '@/data/wheels';
import { Link } from '@/i18n/navigation';
import { WheelWorkspace } from '@/components/WheelWorkspace';
import { AdSlot } from '@/components/AdSlot';

type Props = {
  params: Promise<{ locale: string }>;
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tHome = await getTranslations({ locale, namespace: 'Home' });
  const tUI = await getTranslations({ locale, namespace: 'UI' });
  const messages = (await getMessages()) as {
    Home: { defaultItems: string[]; faqs: Array<{ q: string; a: string }> };
    Wheels: Record<string, { h1: string; description: string }>;
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: messages.Home.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <main className="mx-auto max-w-6xl px-3 pb-8 pt-3 sm:px-4 sm:py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mb-3 text-center sm:mb-6">
        <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-4xl">
          {tHome('h1')}
        </h1>
        <p className="mx-auto mt-1 text-xs font-medium text-slate-500 sm:text-sm">
          Fun · Fast · 100% Free & Private in your browser
        </p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-200" />}>
        <WheelWorkspace initialItems={messages.Home.defaultItems} locale={locale} />
      </Suspense>

      <AdSlot variant="banner" />

      <section id="tools" className="mt-8 scroll-mt-20">
        <h2 className="mb-4 text-xl font-extrabold text-slate-900">{tUI('allWheels')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {WHEELS.map((wheel) => (
            <Link
              key={wheel.slug}
              href={`/wheel/${wheel.slug}`}
              className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl">
                {WHEEL_ICONS[wheel.slug] || '🎡'}
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-900">
                  {messages.Wheels[wheel.slug]?.h1}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                  {messages.Wheels[wheel.slug]?.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="faq" className="mt-10 scroll-mt-20 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-slate-900">{tHome('guideTitle')}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{tHome('guideBody')}</p>

        <h3 className="mt-6 mb-3 text-base font-bold text-slate-900">{tHome('faqTitle')}</h3>
        <div className="space-y-2">
          {messages.Home.faqs.map((faq, idx) => (
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
    </main>
  );
}