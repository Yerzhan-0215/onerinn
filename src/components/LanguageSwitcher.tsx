'use client'

import { usePathname, useRouter } from 'next/navigation'
import { locales } from '../i18n'

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1]

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')

    localStorage.setItem('preferredLocale', newLocale)
    router.push(newPath)
  }

  return (
    <select onChange={handleLanguageChange} value={currentLocale} className="border p-1 rounded">
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  )
}