import '../globals.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'UI' });

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2.5">
                <svg className="h-8 w-8 shrink-0" viewBox="0 0 36 36" aria-hidden="true">
                  <circle cx="18" cy="18" r="16" fill="#0F172A" />
                  <path d="M18 18 L18 3 A15 15 0 0 1 31 10.5 Z" fill="#FBBF24" />
                  <path d="M18 18 L31 10.5 A15 15 0 0 1 31 25.5 Z" fill="#3B82F6" />
                  <path d="M18 18 L31 25.5 A15 15 0 0 1 18 33 Z" fill="#EC4899" />
                  <path d="M18 18 L18 33 A15 15 0 0 1 5 25.5 Z" fill="#EA580C" />
                  <path d="M18 18 L5 25.5 A15 15 0 0 1 5 10.5 Z" fill="#06B6D4" />
                  <path d="M18 18 L5 10.5 A15 15 0 0 1 18 3 Z" fill="#10B981" />
                  <circle cx="18" cy="18" r="4.5" fill="#FFFFFF" />
                </svg>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Wheel<span className="text-orange-600">Tara</span>
                </span>
              </Link>

              <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
                <Link href="/" className="border-b-2 border-orange-600 pb-0.5 text-orange-600">
                  Home
                </Link>
                <a href="#tools" className="transition hover:text-slate-900">
                  {t('allWheels')}
                </a>
                <a href="#faq" className="transition hover:text-slate-900">
                  FAQ
                </a>
              </nav>

              <LanguageSwitcher currentLocale={locale} />
            </div>
          </header>

          {children}

          <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
              <p>© {new Date().getFullYear()} SpinWheel — Free Client-Side Random Picker</p>
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