import { useTranslation } from 'react-i18next';
import userAvatar from '@/assets/images/ava.png';

export default function CreatePostBox({ user, onClick }) {
  const { t } = useTranslation();
  const avatarUrl = user?.avatar || userAvatar;

  return (
    <div
      onClick={onClick}
      className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors select-none"
      role="button"
      tabIndex={0}
      aria-label="Tạo bài viết mới"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={avatarUrl}
          alt={user?.name || 'User'}
          className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
        />
        <span className="text-sm text-zinc-500 dark:text-zinc-400 font-normal">
          {t('createPost.whatsNew', "What's new?")}
        </span>
      </div>

      <button
        type="button"
        className="px-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold text-sm shadow-xs pointer-events-none transition-colors"
      >
        {t('createPost.postBtn', 'Post')}
      </button>
    </div>
  );
}
