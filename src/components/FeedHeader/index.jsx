import { useTranslation } from 'react-i18next';

export default function FeedHeader({ title }) {
  const { t } = useTranslation();
  const displayTitle = title || t('home.feedTitle', 'Trang chủ');

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3.5 transition-colors">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-black dark:text-white tracking-tight">
          {displayTitle}
        </h1>
      </div>
    </header>
  );
}
