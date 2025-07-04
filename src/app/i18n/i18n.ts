import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译资源文件
import en from './locales/en/translation.json';
import kk from './locales/kk/translation.json';
import ru from './locales/ru/translation.json';
import zh from './locales/zh/translation.json';

i18n
  .use(initReactI18next) // 将 i18n 绑定到 React
  .init({
    resources: {
      en: { translation: en },
      kk: { translation: kk },
      ru: { translation: ru },
      zh: { translation: zh }
    },
    lng: 'en', // 默认语言
    fallbackLng: 'en', // 找不到语言时使用
    interpolation: {
      escapeValue: false // React 已自动转义 XSS
    }
  });

export default i18n;
