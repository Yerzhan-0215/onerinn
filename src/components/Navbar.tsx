"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Artworks", href: "/artworks" },
    { name: "Rentals", href: "/rentals" },
  ];

  const langOptions = [
    { code: "kk", label: "Қаз", href: "/kk" },
    { code: "ru", label: "Рус", href: "/ru" },
    { code: "en", label: "EN", href: "/en" },
    { code: "zh", label: "中文", href: "/zh" },
  ];

  return (
    <header className="bg-white shadow-md z-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Onerinn
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-10 text-lg">
          {navItems.map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              className={`hover:text-blue-600 transition-colors duration-200 ${
                pathname === href ? "text-blue-600 font-semibold" : "text-gray-800"
              }`}
            >
              {name}
            </Link>
          ))}

          <Link href="/login" className="ml-6 text-blue-600 font-semibold">
            Login
          </Link>

          {/* Language Dropdown */}
          <div className="ml-4 relative">
            <button
              className="text-gray-800 hover:text-blue-600"
              onClick={() => setLanguageOpen(!languageOpen)}
            >
              🌐
            </button>
            {languageOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white border rounded-md shadow-lg z-50">
                {langOptions.map(({ code, label, href }) => (
                  <Link
                    key={code}
                    href={href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setLanguageOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <nav className="space-y-2">
            {navItems.map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className={`block py-2 text-lg border-b border-gray-200 ${
                  pathname === href ? "text-blue-600 font-semibold" : "text-gray-800"
                }`}
              >
                {name}
              </Link>
            ))}
            <Link href="/login" className="block py-2 text-lg text-blue-600">
              Login
            </Link>
            <div className="flex flex-wrap gap-2 pt-2">
              {langOptions.map(({ code, label, href }) => (
                <Link
                  key={code}
                  href={href}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-blue-100"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
