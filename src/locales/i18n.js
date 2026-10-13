import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viCommon from './vi/common.json';
import enCommon from './en/common.json';

const resources = {
  vi: {
    translation: viCommon,
  },
  en: {
    translation: enCommon,
  },
};

// Đọc ngôn ngữ đã lưu từ localStorage, mặc định là tiếng Việt
const savedLanguage = localStorage.getItem('language') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en', // Ngôn ngữ dự phòng nếu thiếu key dịch
    interpolation: {
      escapeValue: false, // React đã tự escape chuỗi an toàn chống XSS
    },
  });

export default i18n;
