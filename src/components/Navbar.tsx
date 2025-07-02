'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';
import { Menu, Heart, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = pathname.split('/')[1];
  const [language, setLanguage] = useState(currentLocale);

  // 自动从 localStorage 读取语言偏好
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferredLocale');
    if (savedLocale && savedLocale !== currentLocale) {
      const segments = pathname.split('/');
      segments[1] = savedLocale;
      const newPath = segments.join('/');
      router.push(newPath);
    }
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const changeLanguage = (lang: string) => {
    const segments = pathname.split('/');
    segments[1] = lang;
    const newPath = segments.join('/');
    localStorage.setItem('preferredLocale', lang);
    router.push(newPath);
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${language}`} className="text-xl font-bold text-black">
          Onerinn
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href={`/${language}/artworks`} className="hover:text-blue-600">Artworks</Link>
          <Link href={`/${language}/rentals`} className="hover:text-blue-600">Rentals</Link>
          <Link href={`/${language}/login`} className="hover:text-blue-600">Login</Link>
          <Link href={`/${language}/register`} className="hover:text-blue-600">Register</Link>
          <span className="text-sm text-gray-500">Welcome Yerzhan</span>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {locales.map((loc) => (
              <option key={loc} value={loc}>
                {loc.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Icons */}
          <Heart className="w-5 h-5 cursor-pointer" />
          <ShoppingCart className="w-5 h-5 cursor-pointer" />
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link href={`/${language}/artworks`} className="block">Artworks</Link>
          <Link href={`/${language}/rentals`} className="block">Rentals</Link>
          <Link href={`/${language}/login`} className="block">Login</Link>
          <Link href={`/${language}/register`} className="block">Register</Link>
          <span className="block text-sm text-gray-500">Welcome Yerzhan</span>
          <div className="flex space-x-2">
            {locales.map((loc) => (
              <button key={loc} onClick={() => changeLanguage(loc)}>
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex space-x-2 mt-2">
            <Heart className="w-5 h-5 cursor-pointer" />
            <ShoppingCart className="w-5 h-5 cursor-pointer" />
          </div>
        </div>
      )}
    </nav>
  );
}
