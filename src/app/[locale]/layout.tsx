import '../globals.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { HeaderNav } from '@/components/HeaderNav';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    metadataBase: new URL('https://wheeltara.com'),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}/`])),
        'x-default': `/en/`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'WheelTara',
      title: t('title'),
      description: t('description'),
      url: `https://wheeltara.com/${locale}/`,
      locale,
      images: [
        {
          url: '/og-image.jpg',
          width: 1376,
          height: 768,
          alt: 'WheelTara — Free Spin Wheel & Random Name Picker',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'UI' });
  const m = await getTranslations({ locale, namespace: 'Metadata' });

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'WheelTara',
    url: `https://wheeltara.com/${locale}/`,
    description: m('description'),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: locale,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2.5">
                <img src="/logo.png" alt="WheelTara Logo" className="h-8 w-8" />
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Wheel<span className="text-orange-600">Tara</span>
                </span>
              </Link>

              <HeaderNav locale={locale} allWheelsLabel={t('allWheels')} />

              <LanguageSwitcher currentLocale={locale} />
            </div>
          </header>

          {children}

          <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
              <p>© {new Date().getFullYear()} WheelTara — Free Client-Side Random Picker</p>
              <div className="flex flex-wrap justify-center gap-4 font-medium text-slate-600">
                <Link href="/about" className="hover:text-orange-600">About</Link>
                <Link href="/privacy" className="hover:text-orange-600">Privacy</Link>
                <Link href="/terms" className="hover:text-orange-600">Terms</Link>
                <Link href="/contact" className="hover:text-orange-600">Contact</Link>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}