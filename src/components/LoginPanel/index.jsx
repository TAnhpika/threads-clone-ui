import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';

export default function LoginPanel() {
  return (
    <aside className="w-80 shrink-0 hidden lg:block select-none">
      <div className="sticky top-4 space-y-4">
        {/* Card Đăng nhập */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-xs text-center transition-colors">
          <h2 className="text-lg font-bold text-black dark:text-white tracking-tight mb-2">
            Đăng nhập hoặc đăng ký Threads
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Xem mọi người đang nói về điều gì và tham gia cuộc trò chuyện.
          </p>

          {/* Nút Tiếp tục bằng Instagram */}
          <Link
            to="/login"
            className="w-full py-3 px-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-black dark:text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs group"
          >
            <FontAwesomeIcon
              icon={faInstagram}
              className="text-base text-pink-600 group-hover:scale-110 transition-transform"
            />
            <span>Tiếp tục bằng Instagram</span>
          </Link>

          {/* Dòng text Đăng nhập để xem thêm */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <Link
              to="/login"
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors block hover:underline"
            >
              Đăng nhập để xem thêm
            </Link>
          </div>
        </div>

        {/* Footer Bản quyền & Điều khoản */}
        <div className="px-3 text-[11px] text-zinc-400 dark:text-zinc-600 leading-normal space-y-1">
          <p>© {new Date().getFullYear()} Threads Clone · F8 Pro</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <span className="hover:underline cursor-pointer">Điều khoản Threads</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Chính sách quyền riêng tư</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Chính sách cookie</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
