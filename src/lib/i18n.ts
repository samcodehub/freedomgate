import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enCommon from '../../public/locales/en/common.json'
import faCommon from '../../public/locales/fa/common.json'
import arCommon from '../../public/locales/ar/common.json'
import ruCommon from '../../public/locales/ru/common.json'
import isCommon from '../../public/locales/is/common.json'

const resources = {
  en: {
    common: enCommon
  },
  fa: {
    common: faCommon
  },
  ar: {
    common: arCommon
  },
  ru: {
    common: ruCommon
  },
  is: {
    common: isCommon
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  })

export default i18n 