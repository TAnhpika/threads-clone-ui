import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, logout } from '@/features/auth/authSlice';
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
  LogOut,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// 1. Home Icons (Outline & Solid silhouette chuẩn Threads)
function SolidHome({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.5 10.2a2.4 2.4 0 0 1 1.25-2.06l6.6-3.48a3.5 3.5 0 0 1 3.3 0l6.6 3.48a2.4 2.4 0 0 1 1.25 2.06v8.6a2.2 2.2 0 0 1-2.2 2.2h-14.6a2.2 2.2 0 0 1-2.2-2.2v-8.6z" />
    </svg>
  );
}

function OutlineHome({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.5 10.2a2.4 2.4 0 0 1 1.25-2.06l6.6-3.48a3.5 3.5 0 0 1 3.3 0l6.6 3.48a2.4 2.4 0 0 1 1.25 2.06v8.6a2.2 2.2 0 0 1-2.2 2.2h-14.6a2.2 2.2 0 0 1-2.2-2.2v-8.6z" />
    </svg>
  );
}

// 2. Solid Heart Icon
function SolidHeart({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// 3. Solid User Icon
function SolidUser({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

// 4. Solid Mail Icon
function SolidMail({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4.25l-7.46 4.66a1 1 0 0 1-1.08 0L4 8.25V6l8 5 8-5v2.25z" />
    </svg>
  );
}

// 5. Insights / Chart Icon (Khung bo góc chứa biểu đồ cột chuẩn Mockup)
function InsightsIcon({ className = 'w-5 h-5', active = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 17v-4" strokeWidth={active ? 3 : 2.2} />
      <path d="M12 17v-8" strokeWidth={active ? 3 : 2.2} />
      <path d="M16 17v-6" strokeWidth={active ? 3 : 2.2} />
    </svg>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
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
      outlineIcon: OutlineHome,
      solidIcon: SolidHome,
    },
    {
      label: t('nav.create', 'Thread mới'),
      path: '/create',
      outlineIcon: Plus,
      solidIcon: ({ className }) => <Plus className={`${className} stroke-3`} />,
    },
    {
      label: t('nav.search', 'Tìm kiếm'),
      path: '/search',
      outlineIcon: Search,
      solidIcon: ({ className }) => <Search className={`${className} stroke-3`} />,
    },
    {
      label: t('nav.messages', 'Tin nhắn'),
      path: '/messages',
      outlineIcon: Mail,
      solidIcon: SolidMail,
    },
    {
      label: t('nav.activity', 'Hoạt động'),
      path: '/activity',
      outlineIcon: Heart,
      solidIcon: SolidHeart,
    },
    {
      label: t('nav.profile', 'Trang cá nhân'),
      path: '/profile',
      outlineIcon: User,
      solidIcon: SolidUser,
    },
    {
      label: t('nav.insights', 'Thông tin chi tiết'),
      path: '/insights',
      outlineIcon: InsightsIcon,
      solidIcon: ({ className }) => <InsightsIcon className={className} active={true} />,
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
            <div className="flex items-center gap-1.5">
              <svg
                aria-label="Threads"
                role="img"
                viewBox="0 0 976.98 1082"
                className="w-7 h-7 fill-current shrink-0 transition-transform group-hover:scale-105"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M770.347,500.347c-1.355-156.85-86.386-251.367-230.025-251.367-95.872,0-176.499,43.362-218.846,112.472l92.823,64.705c24.053-37.942,57.252-69.448,118.231-69.448,68.77,0,104.341,38.281,114.504,109.423-33.2-5.081-66.399-7.791-100.615-7.791-185.646,0-273.049,84.015-273.049,195.131,0,113.149,87.403,179.548,216.136,179.548,141.267,0,225.621-95.194,260.176-213.086,35.91,16.261,60.64,54.203,60.64,111.116,0,152.447-175.822,235.446-324.881,235.446-219.862,0-363.501-144.316-363.501-379.084,0-287.616,190.05-471.907,445.483-471.907,171.418,0,256.11,75.207,313.701,176.16l94.856-66.399C913.308,94.501,773.396,1,563.358,1,228.653,1,.999,238.478.999,583.008c0,315.057,222.911,497.992,488.507,497.992,219.523,0,441.418-128.055,441.418-347.24,0-114.504-65.721-190.389-160.577-233.413ZM485.441,718.854c-48.444,0-91.129-23.036-91.129-65.383,0-66.738,81.983-87.064,162.271-87.064,30.489,0,60.301,2.032,86.725,7.792-18.971,86.725-75.207,144.655-157.867,144.655Z" />
              </svg>
              <span className="text-[25px] font-bold italic tracking-tight leading-none">threads</span>
            </div>
          </Link>

          {/* Menu Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              // Chọn Solid Icon khi active, Outline Icon khi inactive
              const IconComponent = isActive && item.solidIcon ? item.solidIcon : item.outlineIcon;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={item.onClick}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm transition-all ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-black dark:hover:text-white font-medium'
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-black dark:text-white' : 'stroke-current stroke-2'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Nút Đăng nhập hoặc Tạo bài viết */}
          <div className="pt-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-create-thread'))}
                className="w-full py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-sm text-center block hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
              >
                {t('nav.create', 'Thread mới')}
              </button>
            ) : (
              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-sm text-center block hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
              >
                {t('nav.login', 'Đăng nhập')}
              </Link>
            )}
          </div>
        </div>

        {/* Phần dưới: Nút Xem thêm */}
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

              {/* Tùy chọn Đăng xuất khi đã đăng nhập */}
              {isAuthenticated && (
                <>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(logout());
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 font-medium">
                      <LogOut className="w-4 h-4 text-red-500" />
                      Đăng xuất
                    </span>
                  </button>
                </>
              )}
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
