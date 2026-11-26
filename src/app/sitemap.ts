import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { WHEELS } from '@/data/wheels';

export const dynamic = 'force-static';

const SITE_URL = 'https://wheeltara.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-11-25');
  const paths = ['', ...WHEELS.map((w) => `/wheel/${w.slug}`)];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}/`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : 0.8,
      alternates: {
        languages: {
          ...Object.fromEntries(
            routing.locales.map((alt) => [alt, `${SITE_URL}/${alt}${path}/`])
          ),
          'x-default': `${SITE_URL}/en${path}/`,  
        },
      },
    }))
  );
}