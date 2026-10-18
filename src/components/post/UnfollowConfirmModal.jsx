import { useEffect, useRef } from 'react';
import { getAuthorAvatar, defaultAvatar } from '@/utils/avatar';

/**
 * Modal xác nhận huỷ theo dõi (Unfollow Confirmation Dialog) chuẩn giao diện Threads
 * Hiển thị avatar tác giả, tiêu đề "Unfollow <username>?", và 2 nút Cancel / Unfollow (đỏ).
 */
export default function UnfollowConfirmModal({
  isOpen,
  onClose,
  author = {},
  onConfirmUnfollow,
}) {
  const modalRef = useRef(null);
  const username = author.username || 'user';
  const avatar = author.avatar || getAuthorAvatar(author);

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
      className="fixed inset-0 z-70 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-72 sm:max-w-76 bg-[#242424] dark:bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60 animate-in fade-in zoom-in-95 duration-150 text-white select-none"
      >
        {/* Phần nội dung phía trên: Avatar & Tiêu đề xác nhận */}
        <div className="pt-6 pb-5 px-5 flex flex-col items-center text-center">
          <img
            src={avatar}
            alt={username}
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
            className="w-16 h-16 rounded-full object-cover mb-4 border border-zinc-700/80 shadow-sm"
          />
          <h3 className="font-bold text-base text-white tracking-tight leading-snug">
            Unfollow {username}?
          </h3>
        </div>

        {/* Lưới 2 nút bên dưới: Cancel | Unfollow */}
        <div className="grid grid-cols-2 border-t border-zinc-700/80 divide-x divide-zinc-700/80 text-sm font-semibold">
          <button
            type="button"
            onClick={onClose}
            className="py-3 text-white hover:bg-zinc-800/80 active:bg-zinc-800 transition-colors cursor-pointer text-center outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmUnfollow}
            className="py-3 text-red-500 font-bold hover:bg-zinc-800/80 active:bg-zinc-800 transition-colors cursor-pointer text-center outline-none"
          >
            Unfollow
          </button>
        </div>
      </div>
    </div>
  );
}
