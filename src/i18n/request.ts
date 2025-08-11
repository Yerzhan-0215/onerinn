// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

const SUPPORTED = ['ru', 'kk', 'en', 'zh'] as const;
const DEFAULT_LOCALE = 'ru';

export default getRequestConfig(async ({ locale }) => {
  const safeLocale =
    typeof locale === 'string' && SUPPORTED.includes(locale as any)
      ? (locale as (typeof SUPPORTED)[number])
      : DEFAULT_LOCALE;

  try {
    const messages = (await import(`../messages/${safeLocale}.json`)).default;
    return { locale: safeLocale, messages };
  } catch (error) {
    console.warn(`⚠️ Failed to load messages for locale "${safeLocale}", falling back to default.`, error);
    const messages = (await import(`../messages/${DEFAULT_LOCALE}.json`)).default;
    return { locale: DEFAULT_LOCALE, messages };
  }
});
