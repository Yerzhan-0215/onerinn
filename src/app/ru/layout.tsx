// src/app/ru/layout.tsx
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import path from 'path';
import fs from 'fs/promises';

import SiteShell from '@/components/SiteShell';

export const metadata = { title: 'Onerinn' };

type Props = { children: ReactNode };

async function getMessages() {
  const filePath = path.resolve(process.cwd(), 'src/messages', 'ru.json');
  const fileContent = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContent);
}

export default async function RuLayout({ children }: Props) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale="ru" messages={messages}>
      <SiteShell>
        {children}
      </SiteShell>
    </NextIntlClientProvider>
  );
}
