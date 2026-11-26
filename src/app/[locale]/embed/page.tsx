import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { WheelWorkspace } from '@/components/WheelWorkspace';

export const metadata: Metadata = {
  title: 'Embedded Spin Wheel',
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EmbedPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = (await getMessages()) as {
    Home: { defaultItems: string[] };
  };

  return (
    <Suspense fallback={<div className="p-6 text-center text-sm">Loading wheel...</div>}>
      <WheelWorkspace
        initialItems={messages.Home.defaultItems}
        locale={locale}
        embedOnly
      />
    </Suspense>
  );
}