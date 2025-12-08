// src/app/[locale]/page.tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LoaderGate from '@/components/LoaderGate';
import HomeHero from '@/components/HomeHero';

// Next 15：params 为 Promise
type PageProps = { params: Promise<{ locale: string }> };

// 预渲染所有语言首页（保持静态导出稳定性）
export function generateStaticParams() {
  return ['ru', 'kk', 'en', 'zh'].map((locale) => ({ locale }));
}

// 用 i18n 文案设置 <title>，带兜底
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    title: t('homeTitle', { defaultValue: 'Onerinn — Art & Rentals' })
  };
}

// 页面主体
export default async function LocaleHomePage({ params }: PageProps) {
  // 等待 params（满足 Next 15 异步读取要求）
  await params;

  return (
    <main
      className="
        min-h-[calc(100dvh-var(--site-header-h,64px)-var(--site-footer-h,56px))]
        pt-4 sm:pt-6
      "
    >
      <LoaderGate minMs={1200}>
        <HomeHero />
      </LoaderGate>
    </main>
  );
}
