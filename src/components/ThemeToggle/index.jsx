import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
  const { isDark, setTheme } = useTheme();
  const { t } = useTranslation();

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={handleToggle}
      className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center justify-center focus:outline-none"
      title={isDark ? t('theme.switchToLight', 'Chuyển sang giao diện sáng') : t('theme.switchToDark', 'Chuyển sang giao diện tối')}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
