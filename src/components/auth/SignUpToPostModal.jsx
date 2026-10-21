import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLastLoginAccount } from '@/hooks';
import { AuthFeatureIcon } from '@/components/icons';
import InstagramAuthCard from './InstagramAuthCard';

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

export default function SignUpToPostModal({
  isOpen,
  onClose,
  type = 'post', // 'post' | 'say_more' | 'like' | 'comment' | 'repost'
  canClose = true,
}) {
  const navigate = useNavigate();
  const { lastUsername, savedAccount, refresh } = useLastLoginAccount();

  // Cập nhật thông tin tài khoản đăng nhập gần nhất khi mở modal
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

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
        <AuthFeatureIcon type={type} />

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
        <InstagramAuthCard
          variant="modal"
          title="Continue with Instagram"
          username={lastUsername}
          avatar={savedAccount?.avatar}
          onClick={handleContinueWithInstagram}
          className="mt-7"
        />
      </div>
    </div>
  );
}

export { SignUpToPostModal as AuthPromptModal };
