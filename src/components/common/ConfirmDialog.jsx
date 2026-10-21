import { useEffect, useRef } from "react";
import { defaultAvatar } from "@/utils/avatar";

/**
 * Component Modal / Dialog xác nhận chuẩn phong cách Threads
 * Hỗ trợ bo góc lớn rounded-[24px], nền tối #181818, backdrop mờ,
 * phím tắt Escape, click backdrop, và lưới 2 nút (Cancel | Action).
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  avatar,
  avatarAlt = "Avatar",
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmVariant = "danger", // 'danger' | 'primary' | 'default'
  isLoading = false,
  maxWidth = "w-full max-w-85 sm:max-w-90",
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const getConfirmButtonClasses = () => {
    const baseClasses =
      "py-3.5 transition-colors cursor-pointer text-center outline-none select-none hover:bg-zinc-800/60 active:bg-zinc-800";
    if (confirmVariant === "danger") {
      return `${baseClasses} text-red-500 font-bold`;
    }
    if (confirmVariant === "primary") {
      return `${baseClasses} text-white font-bold`;
    }
    return `${baseClasses} text-white font-medium`;
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
        className={`${maxWidth} bg-[#181818] rounded-6 overflow-hidden shadow-2xl border border-zinc-800/80 animate-in fade-in zoom-in-95 duration-150 text-white select-none`}
      >
        {/* Phần nội dung phía trên: Avatar (nếu có) + Tiêu đề + Giải thích */}
        <div className="pt-6 pb-6 px-6 sm:px-7 flex flex-col items-center text-center">
          {avatar && (
            <img
              src={avatar}
              alt={avatarAlt}
              onError={(e) => {
                e.currentTarget.src = defaultAvatar;
              }}
              className="w-16 h-16 rounded-full object-cover mb-4 border border-zinc-700/80 shadow-sm"
            />
          )}

          {title && (
            <h3 className="font-bold text-[17px] sm:text-lg text-white tracking-tight leading-snug">
              {title}
            </h3>
          )}

          {description && (
            <p className="mt-2.5 text-[14px] sm:text-[15px] leading-relaxed text-[#777777] dark:text-zinc-400 font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Lưới 2 nút bên dưới: Cancel | Confirm */}
        <div className="grid grid-cols-2 border-t border-zinc-800/80 divide-x divide-zinc-800/80 text-[15px]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-3.5 text-white font-medium hover:bg-zinc-800/60 active:bg-zinc-800 transition-colors cursor-pointer text-center outline-none select-none disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={getConfirmButtonClasses()}
          >
            {isLoading ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
