import React from 'react';

/**
 * Modern iOS/Threads style ToggleSwitch component
 * @param {boolean} checked - Trạng thái bật/tắt (active/inactive)
 * @param {function} onChange - Callback khi người dùng chuyển trạng thái: (checked: boolean) => void
 * @param {boolean} disabled - Vô hiệu hóa tương tác
 * @param {'sm' | 'md' | 'lg'} size - Kích thước switch
 * @param {React.ReactNode} checkedIcon - Icon nằm trong thumb khi ON (ví dụ: Moon)
 * @param {React.ReactNode} uncheckedIcon - Icon nằm trong thumb khi OFF (ví dụ: Sun)
 * @param {string} className - Class tùy chỉnh thêm cho track
 * @param {string} ariaLabel - Nhãn mô tả cho accessibility
 */
export default function ToggleSwitch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  checkedIcon = null,
  uncheckedIcon = null,
  className = '',
  ariaLabel = 'Toggle switch',
  ...props
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onChange?.(!checked);
    }
  };

  // Kích thước chuẩn các mức
  const sizeConfig = {
    sm: {
      track: 'w-9 h-5 p-0.5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-12 h-6.5 p-0.5',
      thumb: 'w-5.5 h-5.5',
      translate: 'translate-x-5.5',
    },
    lg: {
      track: 'w-14 h-7.5 p-1',
      thumb: 'w-5.5 h-5.5',
      translate: 'translate-x-6.5',
    },
  }[size] || {
    track: 'w-12 h-6.5 p-0.5',
    thumb: 'w-5.5 h-5.5',
    translate: 'translate-x-5.5',
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 ${
        sizeConfig.track
      } ${
        checked
          ? 'bg-black dark:bg-white border border-black dark:border-white'
          : 'bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      <span
        className={`pointer-events-none flex items-center justify-center rounded-full shadow-sm transform transition-transform duration-200 ease-out ${
          sizeConfig.thumb
        } ${
          checked
            ? `${sizeConfig.translate} bg-white dark:bg-black text-black dark:text-white`
            : 'translate-x-0 bg-white dark:bg-zinc-400 text-zinc-700 dark:text-zinc-800'
        }`}
      >
        {checked ? checkedIcon : uncheckedIcon}
      </span>
    </button>
  );
}
