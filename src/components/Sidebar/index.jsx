import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Plus,
  Search,
  Mail,
  Heart,
  User,
  BarChart3,
  Menu,
  Settings,
  HelpCircle,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  // Đóng menu "Xem thêm" khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      label: t('nav.home', 'Trang chủ'),
      path: '/',
      icon: Home,
    },
    {
      label: t('nav.create', 'Thread mới'),
      path: '/create',
      icon: Plus,
    },
    {
      label: t('nav.search', 'Tìm kiếm'),
      path: '/search',
      icon: Search,
    },
    {
      label: t('nav.messages', 'Tin nhắn'),
      path: '/messages',
      icon: Mail,
    },
    {
      label: t('nav.activity', 'Hoạt động'),
      path: '/activity',
      icon: Heart,
    },
    {
      label: t('nav.profile', 'Trang cá nhân'),
      path: '/profile',
      icon: User,
    },
    {
      label: t('nav.insights', 'Thông tin chi tiết'),
      path: '/insights',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block select-none">
      <div className="sticky top-4 h-[calc(100vh-2rem)] flex flex-col justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-xs transition-colors">
        {/* Phần trên: Logo & Navigation */}
        <div className="space-y-4">
          {/* Logo @threads */}
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-black dark:text-white hover:opacity-85 transition-opacity group"
            title="Threads"
          >
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 192 192"
                className="w-7 h-7 fill-current shrink-0 transition-transform group-hover:scale-105"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.021 72.8105C80.4431 64.5889 88.6666 60.5382 97.222 60.5382C97.3061 60.5382 97.3908 60.5382 97.4749 60.5389C111.458 60.6277 121.218 69.8787 123.011 88.0837C114.86 86.8837 106.195 86.6433 97.1818 87.3697C69.0494 89.6206 51.9864 104.296 53.6496 125.04C54.4947 135.581 61.1687 144.331 71.8021 148.887C80.893 152.782 91.9567 153.111 101.996 149.778C114.735 145.549 123.473 136.37 127.329 123.238C134.426 128.878 143.181 133.518 152.923 135.981L156.402 120.672C147.962 118.536 140.404 114.498 134.197 109.313C137.954 99.8279 140.428 89.288 141.537 88.9883ZM99.9837 134.789C86.7578 139.184 70.3664 136.634 69.4147 124.757C68.5367 113.799 78.4328 103.774 98.4419 102.173C105.127 101.638 111.534 101.761 117.584 102.502C115.168 124.636 107.502 132.291 99.9837 134.789Z" />
              </svg>
              <span className="text-xl font-bold tracking-tight">threads</span>
            </div>
          </Link>

          {/* Menu Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-bold shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-black dark:hover:text-white font-medium'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'stroke-current stroke-[2.4]' : 'stroke-current stroke-2'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Nút Đăng nhập */}
          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm text-center block hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
            >
              {t('nav.login', 'Đăng nhập')}
            </Link>
          </div>
        </div>

        {/* Phần dưới: Nút Xem thêm & Tiện ích ThemeToggle / LanguageSwitcher */}
        <div className="relative pt-3 border-t border-zinc-100 dark:border-zinc-800" ref={moreMenuRef}>
          {/* Popup Menu khi bấm "Xem thêm" */}
          {showMoreMenu && (
            <div className="absolute bottom-14 left-0 w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Tùy chọn
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-zinc-500" />
                  Giao diện
                </span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                  Ngôn ngữ
                </span>
                <LanguageSwitcher />
              </div>
            </div>
          )}

          {/* Thanh chân Sidebar */}
          <div>
            <button
              onClick={() => setShowMoreMenu((prev) => !prev)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                showMoreMenu
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
              title="Xem thêm"
            >
              <Menu className="w-5 h-5" />
              <span>Xem thêm</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
