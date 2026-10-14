import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, logout } from '@/features/auth/authSlice';
import { useTheme } from '@/components/ThemeProvider';
import {
  Plus,
  Search,
  Mail,
  Heart,
  User,
  ChevronRight,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';

// 1. Home Icons (Outline & Solid silhouette chuẩn Barcelona / Threads)
function SolidHome({ className = 'w-5.5 h-5.5' }) {
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

function OutlineHome({ className = 'w-5.5 h-5.5' }) {
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

// 2. Insights Icon
function InsightsIcon({ className = 'w-5.5 h-5.5', active = false }) {
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
      <path d="M8 17v-4" strokeWidth={active ? 3 : 2} />
      <path d="M12 17v-8" strokeWidth={active ? 3 : 2} />
      <path d="M16 17v-6" strokeWidth={active ? 3 : 2} />
    </svg>
  );
}

export default function CollapsibleSidebar({ className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, isDark, setTheme } = useTheme();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuView, setMenuView] = useState('main'); // 'main' | 'appearance' | 'sounds'
  const [soundActivity, setSoundActivity] = useState(() => {
    return localStorage.getItem('sound_activity') !== 'false';
  });
  const [soundMessages, setSoundMessages] = useState(() => {
    return localStorage.getItem('sound_messages') !== 'false';
  });
  const [toastMessage, setToastMessage] = useState(null);

  const menuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Đóng popover menu khi click ra ngoài và reset về view chính
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showMenu) {
      setMenuView('main');
    }
  }, [showMenu]);

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

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const isExpanded = isHovered || showMenu;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 80);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenNewThread = () => {
    if (!isAuthenticated) {
      navigate('/login?continue=/');
      return;
    }
    window.dispatchEvent(
      new CustomEvent('open-create-thread', { detail: { placement: 'center' } })
    );
  };

  // Danh sách các icon nhóm 1 (Home, New thread, Search)
  const topNavItems = [
    {
      label: 'Home',
      path: '/',
      outlineIcon: OutlineHome,
      solidIcon: SolidHome,
      isActive: location.pathname === '/' && !location.search,
    },
    {
      label: 'New thread',
      onClick: handleOpenNewThread,
      outlineIcon: Plus,
      solidIcon: Plus,
      isButton: true,
    },
    {
      label: 'Search',
      path: '/search',
      outlineIcon: Search,
      solidIcon: Search,
      isActive: location.pathname.startsWith('/search'),
    },
  ];

  // Danh sách các icon nhóm 2 (Messages, Activity, Profile, Insights)
  const secondaryNavItems = [
    {
      label: 'Messages',
      path: '/messages',
      outlineIcon: Mail,
      solidIcon: Mail,
      isActive: location.pathname.startsWith('/messages'),
    },
    {
      label: 'Activity',
      path: '/activity',
      outlineIcon: Heart,
      solidIcon: Heart,
      isActive: location.pathname.startsWith('/activity'),
    },
    {
      label: 'Profile',
      path: '/profile',
      outlineIcon: User,
      solidIcon: User,
      isActive: location.pathname.startsWith('/profile') || location.pathname.startsWith('/@'),
    },
    {
      label: 'Insights',
      path: '/insights',
      outlineIcon: InsightsIcon,
      solidIcon: ({ className }) => <InsightsIcon className={className} active={true} />,
      isActive: location.pathname.startsWith('/insights'),
    },
  ];

  const renderNavItem = (item) => {
    const IconComponent = item.isActive ? item.solidIcon : item.outlineIcon;
    const isHome = item.label === 'Home';

    // Item wrapper styling (gọn gàng chuẩn threads mẫu)
    const baseItemClass = `w-full h-11 rounded-2xl flex items-center px-0 transition-all select-none ${
      item.isActive
        ? 'bg-zinc-100 dark:bg-[#1e1e1e] text-black dark:text-white font-bold'
        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-black dark:hover:text-white font-medium'
    }`;

    // Khung icon cố định w-11 h-11
    const iconElement = (
      <div className="w-11 h-11 shrink-0 flex items-center justify-center">
        {/* Khi active ở Home: hiển thị icon SolidHome đen tuyền trên nền xám chuẩn mẫu */}
        {item.isActive && isHome ? (
          <SolidHome className="w-6 h-6 fill-current text-black dark:text-white transition-transform" />
        ) : (
          <IconComponent
            className={`w-6 h-6 stroke-[1.9] transition-transform ${
              item.isActive ? 'text-black dark:text-white' : ''
            }`}
          />
        )}
      </div>
    );

    // Text nhãn xuất hiện mượt mà sang bên phải
    const textElement = (
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded
            ? 'max-w-44 opacity-100 ml-1.5'
            : 'max-w-0 opacity-0 ml-0 pointer-events-none'
        }`}
      >
        <span className="truncate whitespace-nowrap text-sm tracking-tight">
          {item.label}
        </span>
      </div>
    );

    if (item.isButton) {
      return (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          title={item.label}
          className={`${baseItemClass} cursor-pointer text-left`}
        >
          {iconElement}
          {textElement}
        </button>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path}
        title={item.label}
        className={baseItemClass}
      >
        {iconElement}
        {textElement}
      </Link>
    );
  };

  return (
    <aside
      className={`w-18 shrink-0 hidden md:block select-none relative h-screen top-0 z-50 ${className}`}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`absolute top-0 left-0 h-screen border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-black py-4 px-3 select-none transition-[width,box-shadow] duration-200 ease-out z-50 scrollbar-none no-scrollbar flex flex-col justify-between ${
          isExpanded ? 'w-57.5 shadow-2xl overflow-visible' : 'w-18 overflow-hidden'
        }`}
      >
        {/* Phần trên: Logo + Navigation Links + Nút Log in (khi chưa đăng nhập) */}
        <div className="space-y-3.5 w-full">
          {/* 1. Header: Logo @threads */}
          <div className="flex items-center h-10 w-full relative shrink-0">
            <Link
              to="/"
              className="flex items-center text-black dark:text-white hover:opacity-85 transition-opacity group"
              title="Threads"
            >
              {/* Khung icon cố định w-10 h-10 */}
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <svg
                  aria-label="Threads"
                  role="img"
                  viewBox="0 0 976.98 1082"
                  className="w-7 h-7 fill-current shrink-0 transition-transform group-hover:scale-105"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M770.347,500.347c-1.355-156.85-86.386-251.367-230.025-251.367-95.872,0-176.499,43.362-218.846,112.472l92.823,64.705c24.053-37.942,57.252-69.448,118.231-69.448,68.77,0,104.341,38.281,114.504,109.423-33.2-5.081-66.399-7.791-100.615-7.791-185.646,0-273.049,84.015-273.049,195.131,0,113.149,87.403,179.548,216.136,179.548,141.267,0,225.621-95.194,260.176-213.086,35.91,16.261,60.64,54.203,60.64,111.116,0,152.447-175.822,235.446-324.881,235.446-219.862,0-363.501-144.316-363.501-379.084,0-287.616,190.05-471.907,445.483-471.907,171.418,0,256.11,75.207,313.701,176.16l94.856-66.399C913.308,94.501,773.396,1,563.358,1,228.653,1,.999,238.478.999,583.008c0,315.057,222.911,497.992,488.507,497.992,219.523,0,441.418-128.055,441.418-347.24,0-114.504-65.721-190.389-160.577-233.413ZM485.441,718.854c-48.444,0-91.129-23.036-91.129-65.383,0-66.738,81.983-87.064,162.271-87.064,30.489,0,60.301,2.032,86.725,7.792-18.971,86.725-75.207,144.655-157.867,144.655Z" />
                </svg>
              </div>
              {/* Chữ threads xuất hiện khi mở rộng */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isExpanded
                    ? 'max-w-44 opacity-100 ml-1.5'
                    : 'max-w-0 opacity-0 ml-0 pointer-events-none'
                }`}
              >
                <span className="text-2xl font-bold italic tracking-tight leading-none whitespace-nowrap">
                  threads
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Dãy Navigation Items chính gọn gàng */}
          <nav className="space-y-0.5 w-full">
            {/* Nhóm 1: Home, New thread, Search */}
            {topNavItems.map(renderNavItem)}

            {/* Khoảng cách tinh tế giữa Search và Messages */}
            <div className="py-0.5" />

            {/* Nhóm 2: Messages, Activity, Profile, Insights */}
            {secondaryNavItems.map(renderNavItem)}
          </nav>

          {/* 3. NÚT LOG IN THAY THẾ CHO CÁC ITEM CÒN LẠI Ở OTHER FEED (KHI CHƯA ĐĂNG NHẬP) */}
          {!isAuthenticated && (
            <div
              className={`pt-2 transition-all duration-200 ${
                isExpanded
                  ? 'opacity-100 max-h-16'
                  : 'opacity-0 max-h-0 pointer-events-none overflow-hidden'
              }`}
            >
              <Link
                to="/login"
                className="w-full h-10 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm flex items-center justify-center active:scale-98 transition-all shadow-xs cursor-pointer"
              >
                Log in
              </Link>
            </div>
          )}
        </div>

        {/* Phần dưới: Nút tròn hoặc menu [= More] và Popover nằm bên trong Sidebar */}
        <div className="w-full relative mt-auto pt-4" ref={menuRef}>
          {/* Popover Menu: Multi-view (Main -> Appearance / Sounds / Report a problem) */}
          {showMenu && (
            <div
              className="absolute left-full ml-5 bottom-0 w-64 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
              role="menu"
            >
              {/* VIEW 1: MAIN MENU */}
              {menuView === 'main' && (
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setMenuView('appearance')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left group"
                  >
                    <span>Appearance</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white stroke-[2.2] transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMenuView('sounds')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left group"
                  >
                    <span>Sounds</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white stroke-[2.2] transition-colors" />
                  </button>

                  {/* Khoảng cách trước Report a problem như mẫu */}
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      showToast('Báo cáo sự cố');
                    }}
                    className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left"
                  >
                    Report a problem
                  </button>

                  {/* Khi đã đăng nhập hiển thị thêm Settings & Log out */}
                  {isAuthenticated && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          showToast('Cài đặt');
                        }}
                        className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left"
                      >
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(logout());
                          setShowMenu(false);
                          navigate('/login');
                          showToast('Đã đăng xuất thành công');
                        }}
                        className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                      >
                        Log out
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* VIEW 2: APPEARANCE (GIAO DIỆN) */}
              {menuView === 'appearance' && (
                <div className="p-1">
                  {/* Header: Nút back mũi tên trái + Tiêu đề căn giữa */}
                  <div className="flex items-center justify-between pb-3 relative">
                    <button
                      type="button"
                      onClick={() => setMenuView('main')}
                      className="p-1 text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer rounded-lg"
                      title="Back"
                      aria-label="Back"
                    >
                      <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                    </button>
                    <h3 className="text-sm font-bold text-black dark:text-white text-center flex-1 pr-6">
                      Appearance
                    </h3>
                  </div>

                  {/* Thanh điều khiển segmented chuẩn mẫu (Sun, Moon, Auto) */}
                  <div className="bg-zinc-100 dark:bg-[#101010] p-1 rounded-2xl flex items-center justify-between gap-1 border border-zinc-200/80 dark:border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('light');
                        showToast('Giao diện: Sáng');
                      }}
                      className={`flex-1 h-9.5 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-white dark:bg-[#262626] text-black dark:text-white shadow-xs font-semibold'
                          : 'text-zinc-500 hover:text-black dark:hover:text-zinc-300'
                      }`}
                      title="Sáng"
                      aria-label="Light mode"
                    >
                      <Sun className="w-4.5 h-4.5 stroke-2" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('dark');
                        showToast('Giao diện: Tối');
                      }}
                      className={`flex-1 h-9.5 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-white dark:bg-[#262626] text-black dark:text-white shadow-xs font-semibold'
                          : 'text-zinc-500 hover:text-black dark:hover:text-zinc-300'
                      }`}
                      title="Tối"
                      aria-label="Dark mode"
                    >
                      <Moon className="w-4.5 h-4.5 stroke-2" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('system');
                        showToast('Giao diện: Tự động');
                      }}
                      className={`flex-1 h-9.5 flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        theme === 'system'
                          ? 'bg-white dark:bg-[#262626] text-black dark:text-white shadow-xs'
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
                <div className="p-1">
                  {/* Header: Nút back mũi tên trái + Tiêu đề căn giữa */}
                  <div className="flex items-center justify-between pb-2 relative">
                    <button
                      type="button"
                      onClick={() => setMenuView('main')}
                      className="p-1 text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer rounded-lg"
                      title="Back"
                      aria-label="Back"
                    >
                      <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
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
                      <button
                        type="button"
                        role="switch"
                        aria-checked={soundActivity}
                        onClick={toggleSoundActivity}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer ${
                          soundActivity
                            ? 'bg-black dark:bg-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full transition-transform ${
                            soundActivity
                              ? 'translate-x-5 bg-white dark:bg-black'
                              : 'translate-x-0 bg-white dark:bg-zinc-400'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-semibold text-black dark:text-white">
                        Messages
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={soundMessages}
                        onClick={toggleSoundMessages}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer ${
                          soundMessages
                            ? 'bg-black dark:bg-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full transition-transform ${
                            soundMessages
                              ? 'translate-x-5 bg-white dark:bg-black'
                              : 'translate-x-0 bg-white dark:bg-zinc-400'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className={`w-full h-10.5 rounded-xl flex items-center px-0 transition-colors cursor-pointer select-none ${
              showMenu
                ? 'bg-zinc-200 dark:bg-[#1e1e1e] text-black dark:text-white'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-black dark:hover:text-white'
            }`}
            title="More"
            aria-label="More"
          >
            {/* Icon 2 gạch ngang cố định tại w-10 h-10 */}
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current stroke-2" fill="none">
                <line x1="4" y1="9" x2="20" y2="9" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="15" x2="20" y2="15" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Chữ 'More' xuất hiện khi mở rộng */}
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isExpanded
                  ? 'max-w-28 opacity-100 ml-1.5'
                  : 'max-w-0 opacity-0 ml-0 pointer-events-none'
              }`}
            >
              <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
                More
              </span>
            </div>
          </button>
        </div>

        {/* Toast thông báo nhanh (nếu có) */}
        {toastMessage && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold text-center animate-in fade-in duration-100 shadow-md whitespace-nowrap z-50">
            {toastMessage}
          </div>
        )}
      </div>
    </aside>
  );
}
