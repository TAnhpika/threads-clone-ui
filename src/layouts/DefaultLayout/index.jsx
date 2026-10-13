import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

export default function DefaultLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">BaseApp</Link>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-6 text-sm font-medium mr-1">
            <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">{t('nav.home')}</Link>
            <Link to="/profile" className="hover:text-gray-600 dark:hover:text-gray-300">{t('nav.profile')}</Link>
            <Link to="/login" className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">{t('nav.login')}</Link>
          </nav>
          {/* Nút chuyển đổi VI / EN */}
          <LanguageSwitcher />
          {/* Nút Toggle Dark / Light Mode */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} BaseApp. All rights reserved.
      </footer>
    </div>
  );
}
