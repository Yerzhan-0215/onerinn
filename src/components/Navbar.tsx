'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Heart, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'kaz' | 'ru' | 'en'>('en');

  const toggleMenu = () => setIsOpen(!isOpen);
  const changeLanguage = (lang: 'kaz' | 'ru' | 'en') => setLanguage(lang);

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-black">
          Onerinn
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/artworks" className="hover:text-blue-600">Artworks</Link>
          <Link href="/rentals" className="hover:text-blue-600">Rentals</Link>
          <Link href="/login" className="hover:text-blue-600">Login</Link>
          <Link href="/register" className="hover:text-blue-600">Register</Link>
          <span className="text-sm text-gray-500">Welcome Yerzhan</span>

          {/* Language */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as any)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="kaz">Kaz</option>
            <option value="ru">Рус</option>
            <option value="en">En</option>
          </select>

          {/* Icons */}
          <Heart className="w-5 h-5 cursor-pointer" />
          <ShoppingCart className="w-5 h-5 cursor-pointer" />
        </div>

        {/* Hamburger */}
        <button onClick={toggleMenu} className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link href="/artworks" className="block">Artworks</Link>
          <Link href="/rentals" className="block">Rentals</Link>
          <Link href="/login" className="block">Login</Link>
          <Link href="/register" className="block">Register</Link>
          <span className="block text-sm text-gray-500">Welcome Yerzhan</span>
          <div className="flex space-x-2">
            <button onClick={() => changeLanguage('kaz')}>Kaz</button>
            <button onClick={() => changeLanguage('ru')}>Рус</button>
            <button onClick={() => changeLanguage('en')}>En</button>
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
