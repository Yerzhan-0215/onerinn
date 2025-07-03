'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';

export default function Navbar() {
  const pathname = usePathname();
  const [lang, setLang] = useState(pathname.split('/')[1] || 'en');

  const navItems = [
    { label: 'Artworks', href: `/${lang}/artworks` },
    { label: 'Rentals', href: `/${lang}/rentals` },
  ];

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'kk', label: 'KK' },
    { code: 'ru', label: 'RU' },
    { code: 'zh', label: 'ZH' },
  ];

  return (
    <nav className="flex items-center justify-between w-full px-6 py-4 bg-white shadow-md">
      <div className="flex items-center space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-gray-800 hover:text-black font-medium"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <Link
          href={`/${lang}/login`}
          className="text-sm text-blue-600 hover:underline"
        >
          Login / Register
        </Link>

        <select
          value={lang}
          onChange={(e) => {
            const selectedLang = e.target.value;
            const newPath = pathname.replace(/^\/(en|kk|ru|zh)/, '') || '/';
            window.location.href = `/${selectedLang}${newPath}`;
          }}
          className="border px-2 py-1 rounded"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        <FaHeart className="text-xl text-gray-700 hover:text-black cursor-pointer" />
        <FaShoppingCart className="text-xl text-gray-700 hover:text-black cursor-pointer" />
      </div>
    </nav>
  );
}
