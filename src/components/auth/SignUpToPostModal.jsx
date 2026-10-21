import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';

function getLastLoggedInUsername() {
  if (typeof window === 'undefined') return null;
  try {
    const rawAccount = localStorage.getItem('threads_last_login_account');
    if (rawAccount) {
      const parsed = JSON.parse(rawAccount);
      if (parsed?.username) return parsed.username;
      if (parsed?.identifier) return parsed.identifier;
      if (parsed?.name) return parsed.name;
    }
    const lastUsername = localStorage.getItem('threads_last_username') || localStorage.getItem('last_username');
    if (lastUsername) return lastUsername;
  } catch (err) {
    console.error('Failed to get last logged in username:', err);
  }
  return null;
}

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

const MODAL_CONFIGS = {
  post: {
    title: 'Sign up to post',
    subtitle: 'Join Threads to share ideas, ask questions, post random thoughts and more.',
  },
  like: {
    title: "Like this? You'll love Threads.",
    subtitle: 'Sign up to like, reply and more.',
  },
  comment: {
    title: 'Sign up to chime in',
    subtitle: "You're one step away from joining the conversation.",
  },
  repost: {
    title: 'Sign up to spread the word',
    subtitle: "You're one step closer to sparking conversations.",
  },
  say_more: {
    title: 'Say more with Threads',
    subtitle: "Join Threads to share thoughts, find out what's going on, follow your people and more.",
  },
};

function ModalIcon({ type }) {
  if (type === 'say_more') return null;

  if (type === 'like') {
    return (
      <div className="w-14 h-14 flex items-center justify-center mt-1 mb-1">
        <svg viewBox="0 0 24 24" className="w-11.5 h-11.5" fill="none">
          <defs>
            <linearGradient id="auth-grad-like" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="40%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke="url(#auth-grad-like)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (type === 'comment') {
    return (
      <div className="w-14 h-14 flex items-center justify-center mt-1 mb-1">
        <svg viewBox="0 0 24 24" className="w-11.5 h-11.5" fill="none">
          <defs>
            <linearGradient id="auth-grad-comment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="40%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <g transform="scale(-1, 1) translate(-24, 0)">
            <path
              d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
              stroke="url(#auth-grad-comment)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    );
  }

  if (type === 'repost') {
    return (
      <div className="w-14 h-14 flex items-center justify-center mt-1 mb-1">
        <svg viewBox="0 0 24 24" className="w-11.5 h-11.5" fill="none">
          <defs>
            <linearGradient id="auth-grad-repost" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="40%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
            stroke="url(#auth-grad-repost)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 3v5h-5"
            stroke="url(#auth-grad-repost)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
            stroke="url(#auth-grad-repost)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 16H3v5"
            stroke="url(#auth-grad-repost)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // Mặc định type === 'post'
  return (
    <div className="w-14 h-14 flex items-center justify-center mt-1 mb-1">
      <svg viewBox="0 0 36 36" className="w-13 h-13" fill="none">
        <defs>
          <linearGradient id="auth-grad-post" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="40%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path
          d="M17 6H10a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-7"
          stroke="url(#auth-grad-post)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M27.5 4.5a3 3 0 0 1 4 4L19 21l-5 1 1-5 12.5-12.5z"
          stroke="url(#auth-grad-post)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function SignUpToPostModal({
  isOpen,
  onClose,
  type = 'post', // 'post' | 'say_more' | 'like' | 'comment' | 'repost'
  canClose = true,
}) {
  const navigate = useNavigate();
  const [lastUsername, setLastUsername] = useState(getLastLoggedInUsername);

  // Cập nhật username của lần đăng nhập gần nhất khi mở modal
  useEffect(() => {
    if (isOpen) {
      setLastUsername(getLastLoggedInUsername());
    }
  }, [isOpen]);

  // Khóa cuộn trang khi modal đang mở
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && canClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canClose, onClose]);

  if (!isOpen) return null;

  const currentConfig = MODAL_CONFIGS[type] || MODAL_CONFIGS.post;
  const isSayMore = type === 'say_more';

  const handleContinueWithInstagram = () => {
    onClose();
    const continueUrl = window.location.pathname + window.location.search;
    navigate(`/login?continue=${encodeURIComponent(continueUrl)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
      onClick={canClose ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-110 bg-[#181818] border border-zinc-800 rounded-3xl p-8 sm:p-9 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng X ở góc trên bên phải - Chỉ hiển thị khi cho phép đóng (canClose === true) */}
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-zinc-800/60"
            title="Đóng"
          >
            <X className="w-5 h-5 stroke-2" />
          </button>
        )}

        {/* Biểu tượng Neon Gradient (Heart / Comment / Repost / Compose Pen) */}
        <ModalIcon type={type} />

        {/* Tiêu đề chính */}
        <h2
          className={`text-2xl sm:text-[27px] font-black text-white tracking-tight leading-snug max-w-xs sm:max-w-sm ${
            isSayMore ? 'mt-2' : 'mt-4'
          }`}
        >
          {currentConfig.title}
        </h2>

        {/* Phụ đề mô tả */}
        <p className="text-zinc-400 text-sm sm:text-[15px] font-normal mt-2 leading-relaxed max-w-xs sm:max-w-sm">
          {currentConfig.subtitle}
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

            {/* Thông tin tài khoản - nếu có lastUsername thì hiển thị 2 dòng, nếu chưa từng đăng nhập thì chỉ hiển thị "Continue with Instagram" */}
            <div className="text-left min-w-0">
              {lastUsername ? (
                <>
                  <p className="text-xs text-zinc-400 font-medium">
                    Continue with Instagram
                  </p>
                  <p className="text-sm font-bold text-white group-hover:underline truncate mt-0.5">
                    {lastUsername}
                  </p>
                </>
              ) : (
                <span className="text-[15px] font-bold text-white group-hover:underline truncate block">
                  Continue with Instagram
                </span>
              )}
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
