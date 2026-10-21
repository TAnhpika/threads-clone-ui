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
} from 'lucide-react';
import { SolidHome, OutlineHome, InsightsIcon } from '@/components/icons';
import MoreMenu from './MoreMenu';
import { showToast } from '@/utils/toast';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

export default function CollapsibleSidebar({ className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

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

  const renderNavItem = (item) => {
    const IconComponent = item.isActive ? item.solidIcon : item.outlineIcon;
    const isHome = item.label === 'Home';
    const isSearch = item.label === 'Search';

    // Item wrapper styling (gọn gàng chuẩn threads mẫu)
    const baseItemClass = `w-full h-11 rounded-2xl flex items-center px-0 transition-all duration-150 active:scale-95 select-none ${
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
            className={`w-6 h-6 stroke-1.9 transition-transform ${
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

    const content = item.isButton ? (
      <button
        type="button"
        onClick={item.onClick}
        aria-label={item.label}
        className={`${baseItemClass} cursor-pointer text-left`}
      >
        {iconElement}
        {textElement}
      </button>
    ) : (!isAuthenticated && !isHome && !isSearch) ? (
      <button
        type="button"
        onClick={handleOpenSayMore}
        aria-label={item.label}
        className={`${baseItemClass} cursor-pointer text-left`}
      >
        {iconElement}
        {textElement}
      </button>
    ) : (
      <Link
        to={item.path}
        aria-label={item.label}
        onClick={() => {
          if (item.isActive) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className={baseItemClass}
      >
        {iconElement}
        {textElement}
      </Link>
    );

    if (isExpanded) {
      return <div key={item.label}>{content}</div>;
    }

    return (
      <Tooltip key={item.label}>
        <TooltipTrigger render={content} />
        <TooltipContent side="right" sideOffset={10}>
          {item.label}
        </TooltipContent>
      </Tooltip>
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
          {/* 1. Header: Logo @threads & Nút tròn More (khi đã đăng nhập) */}
          <div className="flex items-center justify-between h-10 w-full relative shrink-0">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    to="/"
                    onClick={() => {
                      if (location.pathname === '/' && !location.search) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center text-black dark:text-white hover:opacity-85 transition-opacity group"
                    aria-label="Threads"
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
                }
              />
              {!isExpanded && (
                <TooltipContent side="right" sideOffset={10}>
                  Threads
                </TooltipContent>
              )}
            </Tooltip>

            {/* Khi đã đăng nhập: Hiển thị nút tròn [=] cạnh logo (kèm tooltip More như ảnh mẫu) */}
            {isAuthenticated && (
              <div
                className={`relative z-50 animate-in fade-in duration-150 transition-opacity ${
                  isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                ref={menuRef}
              >
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => setShowMenu((prev) => !prev)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer group ${
                          showMenu
                            ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black'
                            : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                        }`}
                        aria-label="More"
                      >
                        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 stroke-current stroke-2" fill="none">
                          <line x1="5" y1="9" x2="19" y2="9" />
                          <line x1="5" y1="15" x2="19" y2="15" />
                        </svg>
                      </button>
                    }
                  />
                  {!showMenu && (
                    <TooltipContent side="bottom" sideOffset={6}>
                      More
                    </TooltipContent>
                  )}
                </Tooltip>

                {/* Popover MoreMenu khi click nút tròn cạnh logo */}
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

        {/* Phần dưới: Nút tròn hoặc menu [= More] - CHỈ HIỆN KHI CHƯA ĐĂNG NHẬP */}
        {!isAuthenticated && (
          <div className="w-full relative mt-auto pt-4" ref={menuRef}>
            {/* Popover Menu: Multi-view (Main -> Appearance / Sounds / Report a problem) */}
            <MoreMenu
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              anchorRef={menuRef}
              className="absolute left-full ml-5 bottom-0"
              onToast={showToast}
            />

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
        )}

      </div>
    </aside>
  );
}
