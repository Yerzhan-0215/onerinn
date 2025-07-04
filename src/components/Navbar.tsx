'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import LanguageSwitcher from './LanguageSwitcher';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [language, setLanguage] = useState('en');

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const pathLang = pathname?.split('/')[1];
    if (['kk', 'ru', 'zh', 'en'].includes(pathLang)) {
      i18n.changeLanguage(pathLang);
      setLanguage(pathLang);
    }
  }, [pathname, i18n]);

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="text-2xl font-bold text-blue-500">
        <Link href={`/${language}`}>Onerinn</Link>
      </div>
      <div className="flex gap-4">
        <Link href={`/${language}`} className="hover:underline">{t('home')}</Link>
        <Link href={`/${language}/artworks`} className="hover:underline">{t('artworks')}</Link>
        <Link href={`/${language}/rentals`} className="hover:underline">{t('rentals')}</Link>
        <Link href={`/${language}/login`} className="hover:underline">{t('login')}</Link>
        <Link href={`/${language}/register`} className="hover:underline">{t('register')}</Link>
      </div>
      <LanguageSwitcher />
    </nav>
  );
}
