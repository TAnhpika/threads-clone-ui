import { ChevronRight } from "lucide-react";
import { InstagramGlyph } from "@/components/common";

/**
 * Component hiển thị thẻ hành động "Tiếp tục bằng Instagram" / "Continue with Instagram"
 * Hỗ trợ tự động hiển thị 1 dòng (khi chưa từng đăng nhập) hoặc 2 dòng (kèm username khi đã từng đăng nhập)
 *
 * @param {string|null} username - Username của tài khoản đã đăng nhập gần nhất
 * @param {string|null} avatar - URL ảnh đại diện nếu có
 * @param {string} title - Tiêu đề nút (mặc định "Tiếp tục bằng Instagram")
 * @param {function} onClick - Hàm xử lý khi click
 * @param {'default'|'modal'} variant - Biến thể giao diện ('default' cho Login page, 'modal' cho Dark modal)
 * @param {string} className - Các lớp CSS bổ sung
 */
export default function InstagramAuthCard({
  username = null,
  avatar = null,
  title = "Tiếp tục bằng Instagram",
  onClick,
  variant = "default",
  className = "",
}) {
  const isModal = variant === "modal";

  const buttonClasses = isModal
    ? `w-full p-4 rounded-2xl bg-[#121212] hover:bg-[#1e1e1e] border border-zinc-800/80 flex items-center justify-between transition-colors group cursor-pointer ${className}`
    : `w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white hover:bg-zinc-50 dark:bg-[#141414] dark:hover:bg-[#1a1a1a] transition-all cursor-pointer flex items-center justify-between group shadow-xs dark:shadow-sm ${className}`;

  const iconClasses = isModal
    ? "w-11 h-11 rounded-xl bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center p-2 text-white shrink-0 shadow-xs overflow-hidden"
    : "w-10 h-10 rounded-xl bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-md shrink-0 overflow-hidden";

  return (
    <button type="button" onClick={onClick} className={buttonClasses}>
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Logo Gradient Instagram hoặc Avatar nếu có */}
        <div className={iconClasses}>
          {avatar ? (
            <img
              src={avatar}
              alt={username || "Instagram account"}
              className="w-full h-full object-cover"
            />
          ) : (
            <InstagramGlyph
              className={
                isModal
                  ? "w-6 h-6 text-white stroke-2.2"
                  : "w-5.5 h-5.5 text-white"
              }
            />
          )}
        </div>

        {/* Nội dung text: 2 dòng khi có username, 1 dòng khi không có */}
        <div className="text-left min-w-0">
          {username ? (
            <>
              <span
                className={
                  isModal
                    ? "text-xs text-zinc-400 font-medium block truncate"
                    : "text-xs font-semibold text-zinc-500 dark:text-zinc-400 block truncate"
                }
              >
                {title}
              </span>
              <span
                className={
                  isModal
                    ? "text-sm font-bold text-white group-hover:underline truncate mt-0.5 block"
                    : "text-sm font-bold text-black dark:text-white block tracking-tight truncate mt-0.5"
                }
              >
                {username}
              </span>
            </>
          ) : (
            <span
              className={
                isModal
                  ? "text-[15px] font-bold text-white group-hover:underline truncate block"
                  : "text-sm font-bold text-black dark:text-white block tracking-tight truncate"
              }
            >
              {title}
            </span>
          )}
        </div>
      </div>

      {/* Mũi tên ChevronRight */}
      <ChevronRight
        className={
          isModal
            ? "w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
            : "w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-zinc-300 transition-colors shrink-0"
        }
      />
    </button>
  );
}
