// src/app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n.ts'; // 注意这个文件存在

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(params.locale)) notFound();

  return (
    <html lang={params.locale}>
      <body>{children}</body>
    </html>
  );
}
