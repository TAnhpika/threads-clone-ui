import { AlertCircle } from "lucide-react";

export default function AuthAlert({
  type = "success", // "success" | "error"
  message,
  children,
  className = "",
}) {
  const content = message || children;
  if (!content) return null;

  if (type === "error") {
    return (
      <div
        className={`w-full p-3.5 mb-3.5 rounded-2xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-medium text-center flex items-center gap-2 animate-in fade-in duration-200 ${className}`}
      >
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{content}</span>
      </div>
    );
  }

  // Mặc định là banner xanh nhạt thông báo thành công (chuẩn Threads / F8)
  return (
    <div
      className={`w-full px-5 py-4 mb-3.5 rounded-2xl bg-[#f0f7ff] dark:bg-[#0c1e38] border border-[#c7ddfd] dark:border-[#1d4ed8]/40 text-[#1e40af] dark:text-[#93c5fd] text-xs sm:text-[13px] font-normal leading-relaxed text-left animate-in fade-in zoom-in-95 duration-200 ${className}`}
    >
      {content}
    </div>
  );
}
