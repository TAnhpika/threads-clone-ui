import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Heart, MessageCircle, Repeat2, Send, Check } from 'lucide-react';
import defaultAvatar from '@/assets/images/default-avatar.svg';
import instagramWordmark from '@/assets/icons/instagram-wordmark.svg';
import { getAuthorAvatar } from '@/utils/avatar';

// SVG Wordmark "Instagram" chính thức sắc nét
function InstagramWordmark({ className = 'w-36 h-auto' }) {
  return (
    <img
      src={instagramWordmark}
      alt="Instagram"
      className={`${className} brightness-0 invert opacity-95 select-none pointer-events-none object-contain`}
      draggable={false}
    />
  );
}

// Icon Threads "@" dùng cho card sticker
function ThreadsAtIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

export default function AddToIgStoryModal({
  isOpen,
  onClose,
  post,
  onSuccessFeedback,
}) {
  const currentUser = useSelector(selectCurrentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cuộn trang khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAdded(false);
      setIsSubmitting(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const currentUsername = currentUser?.username || 'tuananhpika';
  const currentUserAvatar = currentUser?.avatar || defaultAvatar;

  const author = post.author || post.user || {};
  const authorName = author.name || author.username || 'user';
  const authorUsername = author.username || 'user';
  const authorAvatar = author.avatar || getAuthorAvatar(author);
  const postContent = post.content || '';
  const postMediaUrl =
    post.media?.url ||
    (Array.isArray(post.media_urls) && post.media_urls[0]) ||
    (Array.isArray(post.media?.urls) && post.media.urls[0]) ||
    null;

  const handleAddStory = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsAdded(true);
      if (onSuccessFeedback) {
        onSuccessFeedback('Đã thêm bài viết vào tin Instagram của bạn ✨');
      }
      setTimeout(() => {
        onClose();
      }, 700);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ig-story-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl h-[88vh] max-h-180 bg-[#111111] border border-zinc-800/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
      >
        {/* 1. Header Modal */}
        <header className="px-6 py-3.5 bg-[#141414] border-b border-zinc-850 flex items-center justify-center relative shrink-0">
          <div className="text-center">
            <h2
              id="ig-story-modal-title"
              className="text-[15px] font-bold text-white leading-tight"
            >
              Add to Instagram story
            </h2>
            <p className="text-xs text-zinc-400 leading-tight mt-0.5">
              @{currentUsername} · Your followers
            </p>
          </div>
        </header>

        {/* 2. Body: Logo Instagram bên trái & Mobile Story Canvas ở trung tâm */}
        <div className="flex-1 bg-black relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Logo chữ Instagram ở góc trái phía trên */}
          <div className="absolute left-6 sm:left-10 top-6 sm:top-8 opacity-90 hidden sm:block pointer-events-none">
            <InstagramWordmark className="w-32 sm:w-36 h-auto" />
          </div>

          {/* Khung mô phỏng màn hình Story (Aspect ~ 9:16) */}
          <div className="w-70 sm:w-75 h-full max-h-105 sm:max-h-120 bg-linear-to-b from-[#1f1f22] via-[#141416] to-[#0c0c0e] rounded-5.5 sm:rounded-6.5 p-3 sm:p-3.5 flex flex-col justify-between relative shadow-2xl border border-zinc-800/80 overflow-hidden shrink-0">
            {/* Top Bar Story: Progress Line & User Header */}
            <div className="shrink-0">
              {/* Progress bar mỏng màu trắng */}
              <div className="w-full h-0.625 bg-white/30 rounded-full overflow-hidden mb-2.5">
                <div className="h-full w-full bg-white rounded-full" />
              </div>

              {/* Thông tin người đăng story (Current User) */}
              <div className="flex items-center gap-2">
                <img
                  src={currentUserAvatar}
                  alt={currentUsername}
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                  className="w-6 h-6 rounded-full object-cover border border-zinc-700/80 shrink-0"
                />
                <span className="text-xs font-semibold text-white truncate max-w-42.5">
                  {currentUsername}
                </span>
                <span className="text-[11px] text-zinc-400 shrink-0">1s</span>
              </div>
            </div>

            {/* Trung tâm Story: Thread Post Sticker Card */}
            <div className="bg-[#18181a]/95 backdrop-blur-md border border-white/10 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xl w-full max-w-71.25 mx-auto my-auto transition-transform hover:scale-101">
              {/* Header card: Tác giả bài viết & Logo Threads @ */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={authorAvatar}
                    alt={authorUsername}
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                    className="w-6 h-6 rounded-full object-cover border border-zinc-700 shrink-0"
                  />
                  <span className="text-xs font-bold text-white truncate">
                    {authorUsername}
                  </span>
                </div>
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <ThreadsAtIcon className="w-3 h-3 text-zinc-300" />
                </div>
              </div>

              {/* Nội dung bài viết */}
              {postContent && (
                <p className="text-[12px] leading-relaxed text-zinc-200 line-clamp-6 whitespace-pre-line my-1.5">
                  {postContent}
                </p>
              )}

              {/* Ảnh đính kèm (nếu có) */}
              {postMediaUrl && (
                <div className="my-2 rounded-xl overflow-hidden max-h-36 bg-black/40 border border-zinc-800/80">
                  <img
                    src={postMediaUrl}
                    alt="attachment"
                    className="w-full h-full object-cover max-h-36"
                  />
                </div>
              )}

              {/* Bottom stats: Likes, Comments, Reposts */}
              <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-white/5 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {post.likes || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {post.comments || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat2 className="w-3 h-3" />
                  {post.reposts || 0}
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <Send className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Bottom spacer to keep sticker card perfectly balanced vertically */}
            <div className="h-2 shrink-0" />
          </div>
        </div>

        {/* 3. Footer: Nút Cancel & Add */}
        <footer className="px-6 py-3.5 bg-[#141414] border-t border-zinc-850 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAddStory}
            disabled={isSubmitting || isAdded}
            className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-70"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-3" />
                Added
              </>
            ) : isSubmitting ? (
              'Adding...'
            ) : (
              'Add'
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}

