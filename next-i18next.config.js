module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
} 