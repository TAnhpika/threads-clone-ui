import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';

function InstagramGlyph({ className = 'w-6 h-6 text-white' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
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

export default function SignUpToPostModal({
  isOpen,
  onClose,
  type = 'post', // 'post' | 'say_more'
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPost = type === 'post';

  const title = isPost ? 'Sign up to post' : 'Say more with Threads';
  const subtitle = isPost
    ? 'Join Threads to share ideas, ask questions, post random thoughts and more.'
    : "Join Threads to share thoughts, find out what's going on, follow your people and more.";

  const handleContinueWithInstagram = () => {
    onClose();
    const continueUrl = window.location.pathname + window.location.search;
    navigate(`/login?continue=${encodeURIComponent(continueUrl)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-110 bg-[#181818] border border-zinc-800 rounded-3xl p-8 sm:p-9 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng X ở góc trên bên phải */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-zinc-800/60"
          title="Đóng"
        >
          <X className="w-5 h-5 stroke-2" />
        </button>

        {/* Biểu tượng Compose Pen với viền Neon Gradient rực rỡ - chỉ hiện khi type === 'post' */}
        {isPost && (
          <div className="w-14 h-14 flex items-center justify-center mt-1 mb-1">
            <svg viewBox="0 0 36 36" className="w-13 h-13" fill="none">
              <defs>
                <linearGradient id="compose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="40%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path
                d="M17 6H10a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-7"
                stroke="url(#compose-grad)"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M27.5 4.5a3 3 0 0 1 4 4L19 21l-5 1 1-5 12.5-12.5z"
                stroke="url(#compose-grad)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Tiêu đề chính */}
        <h2
          className={`text-2xl sm:text-[27px] font-black text-white tracking-tight ${
            isPost ? 'mt-4' : 'mt-2'
          }`}
        >
          {title}
        </h2>

        {/* Phụ đề mô tả */}
        <p className="text-zinc-400 text-sm sm:text-[15px] font-normal mt-2 leading-relaxed max-w-xs sm:max-w-sm">
          {subtitle}
        </p>

        {/* Thẻ hành động Continue with Instagram */}
        <button
          type="button"
          onClick={handleContinueWithInstagram}
          className="w-full mt-7 p-4 rounded-2xl bg-[#121212] hover:bg-[#1e1e1e] border border-zinc-800/80 flex items-center justify-between transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Logo Instagram vuông gradient */}
            <div className="w-11 h-11 rounded-xl bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center p-2 text-white shrink-0 shadow-xs">
              <InstagramGlyph className="w-6 h-6 text-white stroke-[2.2]" />
            </div>

            {/* Thông tin tài khoản */}
            <div className="text-left min-w-0">
              <p className="text-xs text-zinc-400 font-medium">
                Continue with Instagram
              </p>
              <p className="text-sm font-bold text-white group-hover:underline truncate mt-0.5">
                tuananhpika
              </p>
            </div>
          </div>

          {/* Mũi tên Chevron phải */}
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
        </button>
      </div>
    </div>
  );
}

export { SignUpToPostModal as AuthPromptModal };
