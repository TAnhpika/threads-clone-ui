import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, logout } from '@/features/auth/authSlice';
import { useTheme } from '@/components/ThemeProvider';
import {
  ChevronRight,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';

export default function MoreMenu({
  isOpen,
  onClose,
  anchorRef,
  className = '',
  onToast,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [menuView, setMenuView] = useState('main'); // 'main' | 'appearance' | 'sounds'
  const [soundActivity, setSoundActivity] = useState(() => {
    return localStorage.getItem('sound_activity') !== 'false';
  });
  const [soundMessages, setSoundMessages] = useState(() => {
    return localStorage.getItem('sound_messages') !== 'false';
  });

  const menuRef = useRef(null);

  const showToast = (msg) => {
    if (onToast) {
      onToast(msg);
    }
  };

  // Reset về view chính khi đóng menu
  useEffect(() => {
    if (!isOpen) {
      setMenuView('main');
    }
  }, [isOpen]);

  // Đóng menu khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        (!anchorRef?.current || !anchorRef.current.contains(event.target))
      ) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  const toggleSoundActivity = () => {
    setSoundActivity((prev) => {
      const next = !prev;
      localStorage.setItem('sound_activity', String(next));
      return next;
    });
  };

  const toggleSoundMessages = () => {
    setSoundMessages((prev) => {
      const next = !prev;
      localStorage.setItem('sound_messages', String(next));
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`w-64 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none ${className}`}
      role="menu"
    >
      {/* VIEW 1: MAIN MENU (Appearance, Sounds, Settings, Report a problem, Log out) */}
      {menuView === 'main' && (
        <div className="space-y-0.5 animate-in fade-in slide-in-from-left-3 duration-200">
          <button
            type="button"
            onClick={() => setMenuView('appearance')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left group"
          >
            <span>Appearance</span>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white stroke-2.2 transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => setMenuView('sounds')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left group"
          >
            <span>Sounds</span>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white stroke-2.2 transition-colors" />
          </button>

          {/* Settings: Khi đã đăng nhập hiển thị ngay dưới Sounds */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                onClose();
                showToast('Cài đặt');
              }}
              className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left"
            >
              Settings
            </button>
          )}

          {/* Đường kẻ phân cách ngăn giữa nhóm trên và Report a problem / Log out */}
          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

          <button
            type="button"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('open-report-problem'));
            }}
            className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left"
          >
            Report a problem
          </button>

          {/* Log out chữ đỏ khi đã đăng nhập */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                onClose();
                navigate('/login');
                showToast('Đã đăng xuất thành công');
              }}
              className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
            >
              Log out
            </button>
          )}
        </div>
      )}

      {/* VIEW 2: APPEARANCE (GIAO DIỆN) */}
      {menuView === 'appearance' && (
        <div className="p-1 animate-in fade-in slide-in-from-right-3 duration-200">
          {/* Header: Nút back mũi tên trái + Tiêu đề căn giữa */}
          <div className="flex items-center justify-between pb-3 relative">
            <button
              type="button"
              onClick={() => setMenuView('main')}
              className="p-1 text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer rounded-lg"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-2.2" />
            </button>
            <h3 className="text-sm font-bold text-black dark:text-white text-center flex-1 pr-6">
              Appearance
            </h3>
          </div>

          {/* Thanh điều khiển segmented chuẩn mẫu với viên trượt mượt mà (Sun, Moon, Auto) */}
          <div className="relative bg-zinc-100 dark:bg-[#101010] p-1 rounded-2xl flex items-center justify-between border border-zinc-200/80 dark:border-zinc-800/60 select-none">
            {/* Sliding Pill Indicator */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-xl bg-white dark:bg-[#262626] shadow-sm transition-transform duration-250 ease-out pointer-events-none ${
                theme === 'light'
                  ? 'translate-x-0'
                  : theme === 'dark'
                  ? 'translate-x-full'
                  : 'translate-x-[200%]'
              }`}
            />

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`relative z-10 flex-1 h-9.5 flex items-center justify-center rounded-xl transition-colors duration-200 cursor-pointer ${
                theme === 'light'
                  ? 'text-black dark:text-white font-semibold'
                  : 'text-zinc-500 hover:text-black dark:hover:text-zinc-300'
              }`}
              title="Sáng"
              aria-label="Light mode"
            >
              <Sun className="w-4.5 h-4.5 stroke-2" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`relative z-10 flex-1 h-9.5 flex items-center justify-center rounded-xl transition-colors duration-200 cursor-pointer ${
                theme === 'dark'
                  ? 'text-black dark:text-white font-semibold'
                  : 'text-zinc-500 hover:text-black dark:hover:text-zinc-300'
              }`}
              title="Tối"
              aria-label="Dark mode"
            >
              <Moon className="w-4.5 h-4.5 stroke-2" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`relative z-10 flex-1 h-9.5 flex items-center justify-center rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                theme === 'system'
                  ? 'text-black dark:text-white font-semibold'
                  : 'text-zinc-500 hover:text-black dark:hover:text-zinc-300'
              }`}
              title="Tự động"
              aria-label="System mode"
            >
              Auto
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: SOUNDS (ÂM THANH) */}
      {menuView === 'sounds' && (
        <div className="p-1 animate-in fade-in slide-in-from-right-3 duration-200">
          {/* Header: Nút back mũi tên trái + Tiêu đề căn giữa */}
          <div className="flex items-center justify-between pb-2 relative">
            <button
              type="button"
              onClick={() => setMenuView('main')}
              className="p-1 text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer rounded-lg"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-2.2" />
            </button>
            <h3 className="text-sm font-bold text-black dark:text-white text-center flex-1 pr-6">
              Sounds
            </h3>
          </div>

          {/* Đoạn mô tả chuẩn mẫu */}
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 px-1 mt-1 mb-3 leading-snug text-left">
            Play a sound on this device when you receive new notifications
          </p>

          {/* Các hàng switch toggles */}
          <div className="space-y-2.5 px-1 pb-1">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-semibold text-black dark:text-white">
                Activity
              </span>
              <ToggleSwitch
                size="sm"
                checked={soundActivity}
                onChange={toggleSoundActivity}
                ariaLabel="Activity sound"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-semibold text-black dark:text-white">
                Messages
              </span>
              <ToggleSwitch
                size="sm"
                checked={soundMessages}
                onChange={toggleSoundMessages}
                ariaLabel="Messages sound"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
