import { Outlet, Link } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-black text-black dark:text-white transition-colors">
      {/* Mobile Header (chỉ hiện trên màn hình nhỏ < md) */}
      <header className="md:hidden sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg
            viewBox="0 0 192 192"
            className="w-7 h-7 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.021 72.8105C80.4431 64.5889 88.6666 60.5382 97.222 60.5382C97.3061 60.5382 97.3908 60.5382 97.4749 60.5389C111.458 60.6277 121.218 69.8787 123.011 88.0837C114.86 86.8837 106.195 86.6433 97.1818 87.3697C69.0494 89.6206 51.9864 104.296 53.6496 125.04C54.4947 135.581 61.1687 144.331 71.8021 148.887C80.893 152.782 91.9567 153.111 101.996 149.778C114.735 145.549 123.473 136.37 127.329 123.238C134.426 128.878 143.181 133.518 152.923 135.981L156.402 120.672C147.962 118.536 140.404 114.498 134.197 109.313C137.954 99.8279 140.428 89.288 141.537 88.9883ZM99.9837 134.789C86.7578 139.184 70.3664 136.634 69.4147 124.757C68.5367 113.799 78.4328 103.774 98.4419 102.173C105.127 101.638 111.534 101.761 117.584 102.502C115.168 124.636 107.502 132.291 99.9837 134.789Z" />
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
      <div className="max-w-7xl mx-auto flex justify-center gap-6 px-4 py-4 sm:px-6">
        {/* Sidebar bên trái */}
        <Sidebar />

        {/* Khu vực nội dung chính bên phải */}
        <main className="flex-1 min-w-0 max-w-5xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
