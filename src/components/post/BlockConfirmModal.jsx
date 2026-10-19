import { useEffect, useRef } from 'react';

/**
 * Modal xác nhận chặn người dùng chuẩn giao diện gốc Threads
 * Thiết kế chính xác theo mẫu: không có avatar, góc bo tròn lớn 24px,
 * tiêu đề "Block {username}?", thông báo giải thích chi tiết và 2 nút Cancel | Block (chữ trắng đậm).
 */
export default function BlockConfirmModal({
  isOpen,
  onClose,
  author = {},
  onConfirmBlock,
}) {
  const modalRef = useRef(null);
  const username = author.username || 'user';

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
            Block {username}?
          </h3>
          <p className="mt-2.5 text-[14px] sm:text-[15px] leading-relaxed text-[#777777] dark:text-zinc-400 font-normal">
            {username} won&apos;t be able to find your profile or content. No one will see their replies to your posts, and they won&apos;t be notified that you blocked them.
          </p>
        </div>

        {/* Lưới 2 nút bên dưới: Cancel | Block */}
        <div className="grid grid-cols-2 border-t border-zinc-800/80 divide-x divide-zinc-800/80 text-[15px]">
          <button
            type="button"
            onClick={onClose}
            className="py-3.5 text-white font-medium hover:bg-zinc-800/60 active:bg-zinc-800 transition-colors cursor-pointer text-center outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmBlock}
            className="py-3.5 text-white font-bold hover:bg-zinc-800/60 active:bg-zinc-800 transition-colors cursor-pointer text-center outline-none"
          >
            Block
          </button>
        </div>
      </div>
    </div>
  );
}
