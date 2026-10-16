import { useState, forwardRef } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export const AuthInput = forwardRef(function AuthInput(
  {
    label,
    type = "text",
    error,
    rightSlot,
    showPasswordToggle = true,
    showErrorIcon = false,
    className = "",
    containerClassName = "",
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const hasError = Boolean(error);

  // Xác định type thực tế cho thẻ input
  const resolvedType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  // Xác định rightSlot: nếu là password và không truyền rightSlot riêng thì hiển thị icon ẩn/hiện
  const resolvedRightSlot =
    rightSlot !== undefined ? (
      rightSlot
    ) : isPasswordField && showPasswordToggle ? (
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setShowPassword((prev) => !prev)}
        className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-1 cursor-pointer focus:outline-none flex items-center justify-center"
        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {showPassword ? (
          <Eye className="w-5 h-5 shrink-0" strokeWidth={1.8} />
        ) : (
          <EyeOff className="w-5 h-5 shrink-0" strokeWidth={1.8} />
        )}
      </button>
    ) : null;

  return (
    <div className={`w-full ${containerClassName}`}>
      <div
        className={`w-full rounded-2xl bg-zinc-100 dark:bg-[#141414] border ${
          hasError
            ? "border-red-500/80 dark:border-red-500/80"
            : "border-zinc-200 dark:border-zinc-800"
        } px-4.5 pt-2 pb-2.5 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors flex items-center justify-between`}
      >
        <div className="flex-1 min-w-0 pr-2">
          {label && (
            <label
              className={`text-[11px] font-medium block mb-0.5 transition-colors ${
                hasError
                  ? "text-red-500 dark:text-red-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {label}
            </label>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={`w-full bg-transparent text-sm text-black dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${className}`}
            {...props}
          />
        </div>

        {resolvedRightSlot && (
          <div className="shrink-0 flex items-center justify-center pl-1">
            {resolvedRightSlot}
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5 px-1 flex items-center gap-1.5">
          {showErrorIcon && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{typeof error === "string" ? error : error?.message}</span>
        </p>
      )}
    </div>
  );
});

export default AuthInput;
