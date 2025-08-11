// src/app/[locale]/layout.tsx
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import BaseLayout from '@/components/BaseLayout';
import path from 'path';
import fs from 'fs/promises';

export const metadata = {
  title: 'Onerinn',
};

type Props = {
  children: React.ReactNode;
  // Next 15：params 是 Promise
  params: Promise<{ locale: string }>;
};

async function getMessages(locale: string) {
  try {
    const filePath = path.resolve(process.cwd(), 'src/messages', `${locale}.json`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Failed to load messages for locale "${locale}":`, error);
    notFound();
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params; // 先 await 再取值
  const messages = await getMessages(locale);

  // 这里不再渲染 <html>/<body>，只包 Provider + BaseLayout
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <BaseLayout>{children}</BaseLayout>
    </NextIntlClientProvider>
  );
}
