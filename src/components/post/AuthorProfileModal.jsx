import { useEffect, useRef } from 'react';
import { getAuthorAvatar, defaultAvatar } from '@/utils/avatar';

/**
 * Modal xem thông tin tác giả (Profile Card) khi click vào nút tick [✓] (Following).
 * Hiển thị Name, Username, Avatar lớn, Bio, Followers count và nút bấm "Following".
 */
export default function AuthorProfileModal({
  isOpen,
  onClose,
  author = {},
  onOpenUnfollow,
}) {
  const cardRef = useRef(null);

  const name = author.name || author.username || 'User';
  const username = author.username || 'user';
  const avatar = author.avatar || getAuthorAvatar(author);
  const bio =
    author.bio ||
    'Messy human. But neat about it.\nINTJ. 26. ♋ . 151cm.\nKCH ──> KUL';
  const followers = author.followers || '4,001 followers';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-60 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-85 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-black dark:text-white animate-in fade-in zoom-in-95 duration-150 transition-colors"
      >
        {/* Hàng trên: Tên + Username bên trái, Avatar tròn lớn bên phải */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-xl text-black dark:text-white leading-tight truncate">
              {name}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-normal mt-0.5 truncate">
              {username}
            </p>
          </div>
          <img
            src={avatar}
            alt={username}
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
            className="w-16 h-16 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
          />
        </div>

        {/* Hàng giữa: Tiểu sử Bio */}
        {bio && (
          <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-line mt-3.5 leading-relaxed font-normal">
            {bio}
          </p>
        )}

        {/* Số lượng người theo dõi */}
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-3 font-normal">
          {followers}
        </p>

        {/* Nút hành động "Following" (bấm vào sẽ mở modal xác nhận Unfollow) */}
        <button
          type="button"
          onClick={onOpenUnfollow}
          className="w-full mt-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-sm text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-center outline-none active:scale-99"
        >
          Following
        </button>
      </div>
    </div>
  );
}
