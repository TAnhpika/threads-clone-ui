import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Modal xác nhận xoá bài viết chuẩn giao diện gốc Threads
 * Thiết kế chính xác theo mẫu: không có avatar, góc bo tròn 24px,
 * tiêu đề "Delete post?", thông báo "If you delete this post, you won't be able to restore it."
 * và 2 nút Cancel | Delete (chữ đỏ đậm).
 */
export default function DeletePostConfirmModal({
  isOpen,
  onClose,
  onConfirmDelete,
}) {
  const modalRef = useRef(null);
  const { t } = useTranslation();

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
      className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[340px] sm:max-w-[360px] bg-[#181818] rounded-[24px] overflow-hidden shadow-2xl border border-zinc-800/80 animate-in fade-in zoom-in-95 duration-150 text-white select-none"
      >
        {/* Phần nội dung phía trên: Tiêu đề & Thông điệp giải thích */}
        <div className="pt-6 pb-6 px-6 sm:px-7 flex flex-col items-center text-center">
          <h3 className="font-bold text-[17px] sm:text-lg text-white tracking-tight leading-snug">
            {t('postMenu.deletePostTitle', 'Delete post?')}
          </h3>
          <p className="mt-2.5 text-[14px] sm:text-[15px] leading-relaxed text-[#777777] dark:text-zinc-400 font-normal">
            {t(
              'postMenu.deletePostDesc',
              "If you delete this post, you won't be able to restore it."
            )}
          </p>
        </div>

        {/* Lưới 2 nút bên dưới: Cancel | Delete */}
        <div className="grid grid-cols-2 border-t border-zinc-800/80 divide-x divide-zinc-800/80 text-[15px]">
          <button
            type="button"
            onClick={onClose}
            className="py-3.5 text-white font-medium hover:bg-zinc-800/60 active:bg-zinc-800 transition-colors cursor-pointer text-center outline-none"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="py-3.5 text-red-500 font-bold hover:bg-zinc-800/60 active:bg-zinc-800 transition-colors cursor-pointer text-center outline-none"
          >
            {t('common.delete', 'Delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
