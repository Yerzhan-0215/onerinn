// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import path from 'path';
import fs from 'fs/promises';

import FixedNavbarPortal from '@/components/FixedNavbarPortal';
import BaseLayout from '@/components/BaseLayout';
import CenterMainShell from '@/components/CenterMainShell';
import FixedFooterPortal from '@/components/FixedFooterPortal';

export const metadata = { title: 'Onerinn' };

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const SUPPORTED_LOCALES = ['en', 'ru', 'kk', 'zh'] as const;

async function getMessages(locale: string) {
  try {
    const filePath = path.resolve(process.cwd(), 'src/messages', `${locale}.json`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch {
    notFound();
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!SUPPORTED_LOCALES.includes(locale as any)) notFound();

  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* 顶部导航 */}
      <FixedNavbarPortal />

      {/* 内容区：留出 Navbar 高度 */}
      <div className="pt-[var(--site-header-h)] min-h-[calc(100dvh-var(--site-header-h))] flex flex-col">
        <BaseLayout className="flex-1">
          <CenterMainShell>{children}</CenterMainShell>
        </BaseLayout>
      </div>

      {/* 底部统一用 Portal 挂载 */}
      <FixedFooterPortal />
    </NextIntlClientProvider>
  );
}
