import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'vi';

  const handleChangeLanguage = (newLang) => {
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="flex items-center gap-1 p-0.5 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900 text-xs font-medium">
      <button
        onClick={() => handleChangeLanguage('vi')}
        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
          currentLang === 'vi'
            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
            : 'text-gray-500 hover:text-black dark:hover:text-white'
        }`}
        title="Tiếng Việt"
      >
        VI
      </button>
      <button
        onClick={() => handleChangeLanguage('en')}
        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
          currentLang === 'en'
            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
            : 'text-gray-500 hover:text-black dark:hover:text-white'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
