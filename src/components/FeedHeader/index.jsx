import { useTranslation } from 'react-i18next';
import { MoreHorizontal } from 'lucide-react';

export default function FeedHeader({ title, isLoggedIn = false }) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3.5 transition-colors">
      <div className="flex items-center justify-between">
        {isLoggedIn ? (
          <div className="flex items-center gap-1.5 font-bold text-base text-black dark:text-white tracking-tight">
            <span>{t('home.forYou', 'For you')}</span>
          </div>
        ) : (
          <h1 className="text-base font-bold text-black dark:text-white tracking-tight">
            {title || t('home.feedTitle', 'Trang chủ')}
          </h1>
        )}

        {isLoggedIn && (
          <button
            type="button"
            className="p-1.5 rounded-full text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Tùy chọn bảng tin"
            aria-label="Tùy chọn bảng tin"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
