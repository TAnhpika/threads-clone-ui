import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, logout } from '@/features/auth/authSlice';
import { useTheme } from '@/components/ThemeProvider';
import {
  Plus,
  Search,
  Send,
  Heart,
  User,
  Bookmark,
  Lock,
} from 'lucide-react';
import CollapsibleSidebar from './CollapsibleSidebar';
import MoreMenu from './MoreMenu';

export { CollapsibleSidebar, MoreMenu };

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

// 2. Insights / Chart Icon
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
      <path d="M8 17v-4" strokeWidth={active ? 3 : 2} />
      <path d="M12 17v-8" strokeWidth={active ? 3 : 2} />
      <path d="M16 17v-6" strokeWidth={active ? 3 : 2} />
    </svg>
  );
}

// 3. Cute Ghost Icon (cho Ghost posts chuẩn hình mẫu)
function GhostIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path
        strokeDasharray="2.5 2"
        strokeLinecap="round"
        d="M6 7.5L3.5 5M6 7.5A8 8 0 1 1 5 14"
      />
      <circle cx="10.5" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
      <path d="M11 14.5c.7.5 1.5.7 2.2.7s1.5-.2 2.2-.7" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({ collapsed = false, miniOnly = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark, setTheme } = useTheme();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showMenu, setShowMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Đóng dropdown menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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
    // Buffer 80ms ngăn giật / nhấp nháy khi rê chuột qua biên
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 80);
  };

  const handleOpenNewThread = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-signup-to-post'));
      return;
    }
    window.dispatchEvent(
      new CustomEvent('open-create-thread', { detail: { placement: 'center' } })
    );
  };

  const handleOpenSayMore = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-say-more'));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const mainNavItems = [
    {
      label: 'For you',
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
    {
      label: 'Messages',
      path: '/messages',
      outlineIcon: Send,
      solidIcon: Send,
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
      isActive:
        !location.pathname.includes('/post/') &&
        !location.pathname.startsWith('/share/') &&
        (location.pathname === '/profile' || location.pathname.startsWith('/@')),
    },
    {
      label: 'Insights',
      path: '/insights',
      outlineIcon: InsightsIcon,
      solidIcon: ({ className }) => <InsightsIcon className={className} active={true} />,
      isActive: location.pathname.startsWith('/insights'),
    },
  ];

  const otherFeeds = [
    {
      label: 'Following',
      path: '/following',
    },
    {
      label: 'Saved',
      path: '/?feed=saved',
      icon: Bookmark,
    },
    {
      label: 'Liked',
      path: '/?feed=liked',
      icon: Heart,
    },
    {
      label: 'Ghost posts',
      path: '/?feed=ghost',
      rightIcon: GhostIcon,
    },
    {
      label: 'Archive',
      path: '/?feed=archive',
      icon: Lock,
    },
  ];

  // Trạng thái hiển thị menu chi tiết:
  // - Nếu không collapsed (Home, Activity, Profile...): luôn luôn hiển thị đầy đủ
  // - Nếu collapsed (chỉ Messages và Insights): hiển thị chi tiết khi isHovered === true
  const isExpanded = !collapsed || isHovered;

  // Render nội dung Sidebar:
  // Toàn bộ các icon (Logo Threads và 7 Main Nav Icons) nằm trong khung cố định w-12 có tâm x = 36px bất biến
  const renderSidebarBody = () => (
    <div className="flex flex-col justify-between h-full select-none overflow-visible">
      {/* 1. Header: Logo @threads & Nút tròn More (khi đã đăng nhập) - Nằm ngoài khối overflow để không bị clip menu */}
      <div className="flex items-center justify-between h-9 w-full relative shrink-0 mb-3 overflow-visible">
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === '/' && !location.search) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center text-black dark:text-white hover:opacity-85 transition-opacity group"
          title="Threads"
        >
          {/* Khung icon @threads cố định w-12, tâm tại x = 36px cùng trục với tất cả các icons */}
          <div className="w-12 h-9 flex items-center justify-center shrink-0">
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
          {/* Chữ threads chỉ hiện khi mở rộng, tuyệt đối không đẩy lệch logo icon */}
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'max-w-32 opacity-100 ml-1'
                : 'max-w-0 opacity-0 ml-0 pointer-events-none'
            }`}
          >
            <span className="text-2xl font-bold italic tracking-tight leading-none whitespace-nowrap">
              threads
            </span>
          </div>
        </Link>

        {/* Khi đã đăng nhập: Hiển thị nút tròn [=] cạnh logo (kèm tooltip More như ảnh mẫu) */}
        {isAuthenticated && (
          <div
            className={`relative z-50 animate-in fade-in duration-150 transition-opacity ${
              isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            ref={menuRef}
          >
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer group border ${
                showMenu
                  ? 'bg-zinc-200 text-black border-zinc-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-700'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black border-transparent dark:bg-[#181818] dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800/80'
              }`}
              title="More"
              aria-label="More"
            >
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 stroke-current stroke-2" fill="none">
                <line x1="5" y1="9" x2="19" y2="9" />
                <line x1="5" y1="15" x2="19" y2="15" />
              </svg>
            </button>

            {/* Popover MoreMenu khi click nút tròn cạnh logo - mở ra bên phải không che nav */}
            <MoreMenu
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              anchorRef={menuRef}
              className="absolute left-0 top-full mt-2 w-64 select-none shadow-2xl z-50"
              onToast={showToast}
            />
          </div>
        )}
      </div>

      {/* 2. Phần nội dung cuộn: Nav items + Other feeds */}
      <div className="space-y-4 w-full flex-1 min-h-0 overflow-y-auto scrollbar-none no-scrollbar pr-0.5">
        <nav className="space-y-1 w-full">
          {mainNavItems.map((item) => {
            const IconComponent = item.isActive ? item.solidIcon : item.outlineIcon;

            // w-full tự động ăn theo chiều rộng khung chứa (48px khi thu gọn, 216px khi mở rộng)
            // Không áp transition trên width để tránh gây xê dịch hay trễ layout
            const itemBaseClass = `flex items-center h-11 rounded-2xl w-full text-sm font-semibold transition-colors duration-150 overflow-hidden ${
              item.isActive
                ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-black dark:hover:text-white font-medium'
            }`;

            // Khung icon cố định kích thước w-12 h-11 với tâm x = 36px từ mép ngoài sidebar
            const iconElement = (
              <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                <IconComponent
                  className={`w-5 h-5 shrink-0 stroke-2 ${
                    item.isActive ? 'text-black dark:text-white' : ''
                  }`}
                />
              </div>
            );

            // Text label xuất hiện mượt mà sang bên phải mà KHÔNG làm di chuyển icon
            const textElement = (
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isExpanded
                    ? 'max-w-40 opacity-100 ml-1'
                    : 'max-w-0 opacity-0 ml-0 pointer-events-none'
                }`}
              >
                <span className="truncate whitespace-nowrap text-sm font-semibold">
                  {item.label}
                </span>
              </div>
            );

            const isHome = item.label === 'For you' || item.label === 'Home';
            const isSearch = item.label === 'Search';

            if (item.isButton) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  title={item.label}
                  className={`${itemBaseClass} cursor-pointer text-left`}
                >
                  {iconElement}
                  {textElement}
                </button>
              );
            }

            // Khi CHƯA ĐĂNG NHẬP: Trừ Search và Home/For you, click các nút khác ở slider sẽ hiện SayMore modal
            if (!isAuthenticated && !isHome && !isSearch) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={handleOpenSayMore}
                  title={item.label}
                  className={`${itemBaseClass} cursor-pointer text-left`}
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
                onClick={() => {
                  if (item.isActive) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={itemBaseClass}
              >
                {iconElement}
                {textElement}
              </Link>
            );
          })}
        </nav>

        {/* 3. Section: Other feeds - Chỉ hiện ra khi hover / mở rộng */}
        {isExpanded && (
          <div className="pt-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-3 py-1 mb-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Other feeds
              </span>
              <button
                type="button"
                onClick={() => showToast('Chỉnh sửa danh sách feeds')}
                className="text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="space-y-0.5">
              {otherFeeds.map((feed) => {
                const IconComponent = feed.icon;
                const RightIconComponent = feed.rightIcon;
                const isActive =
                  feed.path === '/following'
                    ? location.pathname === '/following'
                    : location.search === feed.path.replace('/', '');

                if (!isAuthenticated) {
                  return (
                    <button
                      key={feed.label}
                      type="button"
                      onClick={handleOpenSayMore}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white font-medium cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        {IconComponent && <IconComponent className="w-5 h-5 shrink-0 stroke-2" />}
                        <span className="truncate whitespace-nowrap">{feed.label}</span>
                      </div>
                      {RightIconComponent && (
                        <RightIconComponent className="w-5 h-5 shrink-0 text-zinc-400" />
                      )}
                    </button>
                  );
                }

                return (
                  <Link
                    key={feed.label}
                    to={feed.path}
                    onClick={() => {
                      if (isActive) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {IconComponent && <IconComponent className="w-5 h-5 shrink-0 stroke-2" />}
                      <span className="truncate whitespace-nowrap">{feed.label}</span>
                    </div>
                    {RightIconComponent && (
                      <RightIconComponent className="w-5 h-5 shrink-0 text-zinc-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Phần dưới: Nút [= More] và Popover - CHỈ HIỆN KHI CHƯA ĐĂNG NHẬP */}
      {!isAuthenticated && (
        <div className="w-full relative mt-auto pt-4" ref={menuRef}>
          <MoreMenu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            anchorRef={menuRef}
            className="absolute left-0 bottom-full mb-3 select-none"
            onToast={showToast}
          />

          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className={`w-full h-11 rounded-2xl flex items-center px-0 transition-colors cursor-pointer select-none ${
              showMenu
                ? 'bg-zinc-200 dark:bg-[#1e1e1e] text-black dark:text-white'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-black dark:hover:text-white'
            }`}
            title="More"
            aria-label="More"
          >
            <div className="w-12 h-11 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current stroke-2" fill="none">
                <line x1="4" y1="9" x2="20" y2="9" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="15" x2="20" y2="15" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div
              className={`overflow-hidden transition-all duration-200 ${
                isExpanded
                  ? 'max-w-40 opacity-100 ml-1'
                  : 'max-w-0 opacity-0 ml-0 pointer-events-none'
              }`}
            >
              <span className="truncate whitespace-nowrap text-sm font-semibold">
                More
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Toast thông báo nhanh (nếu có) */}
      {toastMessage && (
        <div className="mt-2 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold text-center animate-in fade-in duration-100 shadow-md">
          {toastMessage}
        </div>
      )}
    </div>
  );

  // GIAO DIỆN COLLAPSED / MINI SIDEBAR: TÁI SỬ DỤNG CollapsibleSidebar
  if (collapsed || miniOnly) {
    return <CollapsibleSidebar />;
  }

  // GIAO DIỆN CỐ ĐỊNH BÌNH THƯỜNG CHO CÁC TRANG CÒN LẠI (Home, Activity, Profile, PostDetail,...)
  return (
    <aside className="w-60 shrink-0 hidden md:block select-none overflow-visible relative z-40">
      <div className="sticky top-4 h-[calc(100vh-2rem)] py-1 flex flex-col justify-between overflow-visible z-40">
        {renderSidebarBody()}
      </div>
    </aside>
  );
}
