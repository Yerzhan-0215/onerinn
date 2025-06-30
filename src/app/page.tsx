// src/app/page.tsx
import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n.ts'

export default function Home() {
  redirect(`/${defaultLocale}`)
}
