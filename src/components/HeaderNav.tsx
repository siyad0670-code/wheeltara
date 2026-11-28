'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';

interface HeaderNavProps {
  locale: string;
  allWheelsLabel: string;
}

export function HeaderNav({ locale, allWheelsLabel }: HeaderNavProps) {
  const pathname = usePathname();
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const [activeTab, setActiveTab] = useState<'home' | 'tools' | 'faq'>('home');

  useEffect(() => {
    if (!isHomePage) {
      setActiveTab('home');
      return;
    }
    const hash = window.location.hash;
    if (hash === '#tools') setActiveTab('tools');
    else if (hash === '#faq') setActiveTab('faq');
    else setActiveTab('home');
  }, [isHomePage, pathname]);

  const activeClass = 'border-b-2 border-orange-600 pb-0.5 text-orange-600';
  const normalClass = 'pb-0.5 text-slate-600 transition hover:text-slate-900';

  return (
    <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
      <Link
        href="/"
        onClick={() => {
          setActiveTab('home');
          if (isHomePage) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className={isHomePage && activeTab === 'home' ? activeClass : normalClass}
      >
        Home
      </Link>
      <Link
        href="/#tools"
        onClick={() => setActiveTab('tools')}
        className={isHomePage && activeTab === 'tools' ? activeClass : normalClass}
      >
        {allWheelsLabel}
      </Link>
      <Link
        href="/#faq"
        onClick={() => setActiveTab('faq')}
        className={isHomePage && activeTab === 'faq' ? activeClass : normalClass}
      >
        FAQ
      </Link>
    </nav>
  );
}