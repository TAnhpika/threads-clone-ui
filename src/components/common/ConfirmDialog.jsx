import { defaultAvatar } from "@/utils/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Component Modal / Dialog xác nhận chuẩn 100% phong cách gốc Meta Threads:
 * - Bo góc chuẩn rounded-3xl (24px)
 * - Nền tối đặc trưng #181818, viền mỏng border-white/10
 * - Chiều rộng tối ưu max-w-77.5 (310px) cân đối
 * - Phông chữ tiêu đề text-[17px] font-bold text-white
 * - Mô tả text-[14.5px] text-[#777777]
 * - 2 nút Cancel (font-bold text-white) | Delete/Action (font-bold text-[#ff3040])
 * - Lưới 2 nút cao h-13 chia đôi bằng đường phân cách mỏng divide-white/10
 * - Hỗ trợ A11y, Focus Trap, Escape key & Backdrop click tự động
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
  maxWidth = "w-full max-w-77.5",
}) {
  const getConfirmButtonClasses = () => {
    const baseClasses =
      "h-13 flex items-center justify-center transition-colors cursor-pointer text-center outline-none select-none hover:bg-white/5 active:bg-white/10 text-[15px] disabled:opacity-50";
    if (confirmVariant === "danger") {
      return `${baseClasses} text-[#ff3040] font-bold`;
    }
    if (confirmVariant === "primary") {
      return `${baseClasses} text-white font-bold`;
    }
    return `${baseClasses} text-white font-bold`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent
        showCloseButton={false}
        className={`${maxWidth} bg-[#181818] rounded-3xl overflow-hidden shadow-2xl border border-white/10 p-0 text-white select-none flex flex-col gap-0`}
      >
        {/* Phần nội dung phía trên: Avatar (nếu có) + Tiêu đề + Giải thích */}
        <div className="pt-7 pb-6 px-6 sm:px-7 flex flex-col items-center text-center">
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
            <DialogTitle className="font-bold text-[17px] text-white tracking-tight leading-snug text-center">
              {title}
            </DialogTitle>
          )}

          {description && (
            <DialogDescription className="mt-2.5 text-[14.5px] leading-relaxed text-[#777777] dark:text-[#777777] font-normal text-center">
              {description}
            </DialogDescription>
          )}
        </div>

        {/* Lưới 2 nút bên dưới: Cancel | Confirm */}
        <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10 text-[15px]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-13 flex items-center justify-center text-white font-bold text-[15px] hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer text-center outline-none select-none disabled:opacity-50"
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
      </DialogContent>
    </Dialog>
  );
}
