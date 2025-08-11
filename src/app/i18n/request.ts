// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // 从项目根目录的 /messages 读取 JSON
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});
