'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales } from '../../i18n'; // 从 /src/components/Navbar/LanguageSwitcher.tsx 回到 /src/i18n

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname() ?? '/'; // ← 兜底，避免 TS 报 null
  const segments = pathname.split('/');

  // 当前语言（默认 en）
  const currentLocale = ['ru', 'kk', 'zh', 'en'].includes(segments[1]) ? segments[1] : 'en';

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const parts = pathname.split('/');
    parts[1] = newLocale === 'en' ? '' : newLocale;
    const newPath = ('/' + parts.filter(Boolean).join('/')).replace(/\/+/g, '/');
    localStorage.setItem('preferredLocale', newLocale);
    router.push(newPath);
  };

  return (
    <select
      onChange={handleLanguageChange}
      value={currentLocale}
      className="onerinn-select"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
