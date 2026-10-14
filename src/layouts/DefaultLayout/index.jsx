import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import Sidebar, { CollapsibleSidebar } from '@/components/Sidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

export default function DefaultLayout() {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isHome = location.pathname === '/' || location.pathname === '/custom_feed/create';
  const isCollapsedLayout =
    location.pathname.startsWith('/messages') ||
    location.pathname.startsWith('/insights');

  // Khi chưa đăng nhập: CHỈ hiển thị mini sidebar khi đang ở home. Ở các trang khác không hiện sidebar.
  const showSidebar = isAuthenticated || isHome;
  const isMiniSidebar = !isAuthenticated && isHome;

  // Chế độ toàn màn hình không viền cho trang Tin nhắn & Insights (chuẩn giao diện Threads Web)
  if (isCollapsedLayout && isAuthenticated) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white flex">
        {/* Sidebar thu gọn icon-rail tái sử dụng */}
        <CollapsibleSidebar />

        {/* Khung nội dung toàn màn hình */}
        <main className="flex-1 min-w-0 h-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    );
  }

  // Chế độ Unauthenticated Home: Sidebar sát lề trái, Content căn giữa toàn màn hình
  if (isMiniSidebar) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors relative">
        {/* Mobile Header (chỉ hiện trên màn hình nhỏ < md) */}
        <header className="md:hidden sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <svg
              aria-label="Threads"
              role="img"
              viewBox="0 0 976.98 1082"
              className="w-7 h-7 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M770.347,500.347c-1.355-156.85-86.386-251.367-230.025-251.367-95.872,0-176.499,43.362-218.846,112.472l92.823,64.705c24.053-37.942,57.252-69.448,118.231-69.448,68.77,0,104.341,38.281,114.504,109.423-33.2-5.081-66.399-7.791-100.615-7.791-185.646,0-273.049,84.015-273.049,195.131,0,113.149,87.403,179.548,216.136,179.548,141.267,0,225.621-95.194,260.176-213.086,35.91,16.261,60.64,54.203,60.64,111.116,0,152.447-175.822,235.446-324.881,235.446-219.862,0-363.501-144.316-363.501-379.084,0-287.616,190.05-471.907,445.483-471.907,171.418,0,256.11,75.207,313.701,176.16l94.856-66.399C913.308,94.501,773.396,1,563.358,1,228.653,1,.999,238.478.999,583.008c0,315.057,222.911,497.992,488.507,497.992,219.523,0,441.418-128.055,441.418-347.24,0-114.504-65.721-190.389-160.577-233.413ZM485.441,718.854c-48.444,0-91.129-23.036-91.129-65.383,0-66.738,81.983-87.064,162.271-87.064,30.489,0,60.301,2.032,86.725,7.792-18.971,86.725-75.207,144.655-157.867,144.655Z" />
            </svg>
            <span className="font-black text-lg">threads</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              to="/login"
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-black text-white dark:bg-white dark:text-black"
            >
              Đăng nhập
            </Link>
          </div>
        </header>

        {/* Sidebar thu gọn cố định sát lề trái */}
        <div className="fixed top-0 left-0 h-screen z-50 hidden md:block">
          <CollapsibleSidebar />
        </div>

        {/* Khu vực nội dung chính: Căn giữa toàn màn hình với lề trái trừ khoảng w-18 của mini sidebar */}
        <main className="w-full min-h-screen md:pl-18 py-6 px-4 flex justify-center">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-black text-black dark:text-white transition-colors">
      {/* Mobile Header (chỉ hiện trên màn hình nhỏ < md) */}
      <header className="md:hidden sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg
            aria-label="Threads"
            role="img"
            viewBox="0 0 976.98 1082"
            className="w-7 h-7 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M770.347,500.347c-1.355-156.85-86.386-251.367-230.025-251.367-95.872,0-176.499,43.362-218.846,112.472l92.823,64.705c24.053-37.942,57.252-69.448,118.231-69.448,68.77,0,104.341,38.281,114.504,109.423-33.2-5.081-66.399-7.791-100.615-7.791-185.646,0-273.049,84.015-273.049,195.131,0,113.149,87.403,179.548,216.136,179.548,141.267,0,225.621-95.194,260.176-213.086,35.91,16.261,60.64,54.203,60.64,111.116,0,152.447-175.822,235.446-324.881,235.446-219.862,0-363.501-144.316-363.501-379.084,0-287.616,190.05-471.907,445.483-471.907,171.418,0,256.11,75.207,313.701,176.16l94.856-66.399C913.308,94.501,773.396,1,563.358,1,228.653,1,.999,238.478.999,583.008c0,315.057,222.911,497.992,488.507,497.992,219.523,0,441.418-128.055,441.418-347.24,0-114.504-65.721-190.389-160.577-233.413ZM485.441,718.854c-48.444,0-91.129-23.036-91.129-65.383,0-66.738,81.983-87.064,162.271-87.064,30.489,0,60.301,2.032,86.725,7.792-18.971,86.725-75.207,144.655-157.867,144.655Z" />
          </svg>
          <span className="font-black text-lg">threads</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            to="/login"
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-black text-white dark:bg-white dark:text-black"
          >
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Main Container: Sidebar cố định bên trái + Khu vực nội dung chính bên phải */}
      <div className={`mx-auto flex justify-center gap-6 px-4 py-4 sm:px-6 ${
        isMiniSidebar ? 'w-full max-w-7xl' : 'max-w-7xl'
      }`}>
        {/* Sidebar bên trái: chỉ hiện khi đã đăng nhập HOẶC khi đang ở Home */}
        {showSidebar && (isMiniSidebar ? <CollapsibleSidebar /> : <Sidebar />)}

        {/* Khu vực nội dung chính bên phải */}
        <main className="flex-1 min-w-0 max-w-5xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
