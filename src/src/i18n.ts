export const locales = ['en', 'zh', 'kk', 'ru'] as const;
export const defaultLocale = 'en';

export type Locale = (typeof locales)[number];
