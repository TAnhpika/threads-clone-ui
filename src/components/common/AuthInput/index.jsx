import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export const AuthInput = forwardRef(function AuthInput(
  {
    label,
    error,
    rightSlot,
    className = "",
    containerClassName = "",
    ...props
  },
  ref
) {
  const hasError = Boolean(error);

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
            className={`w-full bg-transparent text-sm text-black dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${className}`}
            {...props}
          />
        </div>

        {rightSlot && (
          <div className="shrink-0 flex items-center justify-center pl-1">
            {rightSlot}
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5 px-1 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{typeof error === "string" ? error : error?.message}</span>
        </p>
      )}
    </div>
  );
});

export default AuthInput;
