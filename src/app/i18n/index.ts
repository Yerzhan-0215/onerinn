import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/public/en/navbar.json'
import ru from '@/public/ru/navbar.json'
import kk from '@/public/kk/navbar.json'
import zh from '@/public/zh/navbar.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      kk: { translation: kk },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
