import { Link } from 'react-router-dom';

function InstagramGlyph({ className = 'w-5 h-5 text-white' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function LoginPanel() {
  return (
    <aside className="w-87.5 shrink-0 hidden lg:block select-none">
      <div className="sticky top-4 space-y-4">
        {/* Card Đăng nhập */}
        <div className="p-7 bg-[#141414] border border-zinc-800/80 rounded-3xl shadow-xs text-center transition-colors">
          <h2 className="text-lg font-bold text-white tracking-tight mb-2">
            Log in or sign up for Threads
          </h2>

          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            See what people are talking about and join the conversation.
          </p>

          {/* Nút Tiếp tục bằng Instagram */}
          <Link
            to="/login"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1c1c1c] hover:bg-[#242424] border border-zinc-800 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs group"
          >
            <InstagramGlyph className="w-5 h-5 text-white group-hover:scale-105 transition-transform" />
            <span>Continue with Instagram</span>
          </Link>

          {/* Dòng link Log in with username instead */}
          <div className="mt-5">
            <Link
              to="/login"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors block hover:underline"
            >
              Log in with username instead
            </Link>
          </div>
        </div>

        {/* Footer Bản quyền & Điều khoản chuẩn mẫu */}
        <div className="px-2 text-[11px] text-zinc-600 leading-relaxed text-center space-y-1">
          <p className="flex items-center justify-center gap-1.5 flex-wrap">
            <span>© 2026</span>
            <Link to="/login" className="hover:underline">Threads Terms</Link>
            <Link to="/login" className="hover:underline">Privacy Policy</Link>
            <Link to="/login" className="hover:underline">Cookies Policy</Link>
          </p>
          <p>
            <button
              type="button"
              onClick={() => window.alert('Report a problem')}
              className="hover:underline cursor-pointer"
            >
              Report a problem
            </button>
          </p>
        </div>
      </div>
    </aside>
  );
}
