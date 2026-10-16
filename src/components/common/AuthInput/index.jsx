import { useState, useRef, useEffect, useId, forwardRef } from "react";
import { AlertCircle, Eye, EyeOff, X } from "lucide-react";

export const AuthInput = forwardRef(function AuthInput(
  {
    id,
    label,
    placeholder,
    type = "text",
    error,
    rightSlot,
    showPasswordToggle = true,
    showErrorIcon = false,
    showClearButton = true,
    onClear,
    onChange,
    onFocus,
    onBlur,
    onInput,
    className = "",
    containerClassName = "",
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const inputRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(
    props.value ?? props.defaultValue ?? ""
  );

  const isControlled = props.value !== undefined;
  const currentValue = isControlled ? props.value : internalValue;
  const hasValue = Boolean(
    (currentValue !== undefined && currentValue !== null && String(currentValue).length > 0) ||
    (inputRef.current && inputRef.current.value && inputRef.current.value.length > 0)
  );
  const isFloating = isFocused || hasValue;

  const isPasswordField = type === "password";
  const hasError = Boolean(error);
  const floatingLabel = label || placeholder;

  // Giữ ref hai chiều cho cả forwarded ref và internalRef
  const handleRef = (node) => {
    inputRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // Kiểm tra autofill hoặc giá trị ban đầu từ DOM
  useEffect(() => {
    if (inputRef.current && inputRef.current.value && !hasValue) {
      setInternalValue(inputRef.current.value);
    }
  }, [hasValue]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onBlur?.(e);
  };

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  const handleInput = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onInput?.(e);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(inputRef.current, "");
      } else {
        inputRef.current.value = "";
      }
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setInternalValue("");
    onClear?.();
    inputRef.current?.focus();
  };

  // Xác định type thực tế cho thẻ input
  const resolvedType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  // Xác định rightSlot:
  // 1. Nếu truyền rightSlot riêng -> ưu tiên hàng đầu
  // 2. Nếu là password -> hiện icon ẩn/hiện password
  // 3. Nếu showClearButton và đang có nội dung -> hiện icon X để xóa
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
    ) : showClearButton && hasValue && !isPasswordField ? (
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleClear}
        className="text-zinc-400 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors p-1 cursor-pointer focus:outline-none flex items-center justify-center"
        title="Xóa"
        aria-label="Xóa"
      >
        <X className="w-5 h-5 shrink-0" strokeWidth={2} />
      </button>
    ) : null;

  return (
    <div className={`w-full ${containerClassName}`}>
      <div
        onClick={() => inputRef.current?.focus()}
        className={`relative w-full h-13 sm:h-13.5 rounded-2xl bg-zinc-100 dark:bg-[#141414] border ${
          hasError
            ? "!border-red-500 hover:!border-red-500 focus-within:!border-red-500 active:!border-red-500"
            : "border-zinc-200 hover:border-zinc-400 focus-within:border-zinc-400 active:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600 dark:focus-within:border-zinc-600 dark:active:border-zinc-600"
        } px-4.5 transition-colors duration-150 flex items-center justify-between cursor-text`}
      >
        <div className="relative flex-1 min-w-0 h-full flex flex-col justify-center">
          {/* Nhãn Floating: Khi chưa focus thì nằm ở giữa như placeholder, khi focus/có giá trị thì trượt lên trên thành label */}
          {floatingLabel && (
            <label
              htmlFor={inputId}
              className={`absolute left-0 transition-all duration-150 ease-out pointer-events-none select-none origin-left ${
                isFloating
                  ? `top-2 text-[11px] font-medium leading-tight ${
                      hasError
                        ? "text-red-500 dark:text-red-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`
                  : `top-1/2 -translate-y-1/2 text-sm font-normal ${
                      hasError
                        ? "text-red-500/90 dark:text-red-400/90"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`
              }`}
            >
              {floatingLabel}
            </label>
          )}

          {/* Ô nhập input: khi floating thì thụt xuống dưới để nhãn nằm phía trên */}
          <input
            id={inputId}
            ref={handleRef}
            type={resolvedType}
            placeholder={isFloating ? placeholder : ""}
            className={`w-full bg-transparent text-sm text-black dark:text-white outline-none transition-all duration-150 ${
              isFloating ? "pt-4.5 pb-0.5" : "pt-0 pb-0"
            } ${className}`}
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onInput={handleInput}
          />
        </div>

        {resolvedRightSlot && (
          <div className="shrink-0 flex items-center justify-center pl-1 z-10">
            {resolvedRightSlot}
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5 px-1 flex items-center gap-1.5 animate-in fade-in duration-150">
          {showErrorIcon && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{typeof error === "string" ? error : error?.message}</span>
        </p>
      )}
    </div>
  );
});

export default AuthInput;
