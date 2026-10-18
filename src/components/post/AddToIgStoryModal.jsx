import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Heart, MessageCircle, Repeat2, Send, Check } from 'lucide-react';
import defaultAvatar from '@/assets/images/default-avatar.svg';
import { getAuthorAvatar } from '@/utils/avatar';

// SVG Wordmark "Instagram" phong cách chữ viết tay đặc trưng
function InstagramWordmark({ className = 'w-32 h-auto' }) {
  return (
    <svg
      viewBox="0 0 105 32"
      fill="currentColor"
      className={className}
      aria-label="Instagram"
    >
      <path d="M12.3 8.1c-.8.1-1.6.3-2.3.6-.9.4-1.6 1.1-2.1 1.9-.5.9-.7 1.9-.7 3.1v10.9h3.4V14.1c0-.9.2-1.6.6-2.1.4-.5.9-.7 1.6-.7.6 0 1.2.2 1.6.6.4.4.6 1 .6 1.8v10.9h3.4V13.8c0-1.8-.5-3.2-1.6-4.2-1.1-1-2.6-1.5-4.5-1.5zm-5.7-4.4c-.6 0-1.1.2-1.5.6-.4.4-.6.9-.6 1.5 0 .6.2 1.1.6 1.5.4.4.9.6 1.5.6.6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.5 0-.6-.2-1.1-.6-1.5-.4-.4-.9-.6-1.5-.6zm18.8 15.6c-.4-.5-1-.9-1.8-1.2-.8-.3-1.8-.6-3-.9-1.5-.4-2.6-.9-3.3-1.5-.7-.6-1-1.4-1-2.4 0-1.2.5-2.2 1.5-2.9 1-.7 2.3-1.1 3.9-1.1 1.4 0 2.6.3 3.6.9 1 .6 1.6 1.5 1.9 2.7l-3.1.8c-.2-.6-.5-1.1-.9-1.4-.4-.3-1-.5-1.6-.5-.7 0-1.2.2-1.6.5-.4.3-.5.7-.5 1.2 0 .5.2.9.6 1.2.4.3 1.1.6 2.1.9 1.6.4 2.8.9 3.6 1.5.8.6 1.2 1.5 1.2 2.7 0 1.3-.5 2.3-1.5 3.1-1 .8-2.4 1.2-4.1 1.2-1.7 0-3.1-.4-4.2-1.2-1.1-.8-1.7-1.9-1.8-3.3l3.2-.4c.1.8.4 1.4.9 1.8.5.4 1.1.6 1.9.6.8 0 1.5-.2 1.9-.6.4-.4.6-.9.6-1.4 0-.6-.3-1.1-.8-1.5zm10.7-7.2h-2.5v-3.2h2.5v-3.5h3.3v3.5h3.4v3.2h-3.4v7.7c0 .5.1.9.3 1.1.2.2.6.3 1.1.3.6 0 1.2-.1 1.8-.4l.8 2.8c-.9.5-2.1.7-3.4.7-1.4 0-2.5-.4-3.2-1.1-.7-.7-1-1.9-1-3.4v-8.9zm16.1 12.5c-.8 0-1.5-.2-2.1-.6-.6-.4-1.1-1-1.4-1.7v2h-3.3V6.2h3.3v7.3c.4-.7.9-1.3 1.5-1.7.6-.4 1.4-.6 2.2-.6 1.6 0 2.9.6 3.9 1.9 1 1.3 1.5 3 1.5 5.1s-.5 3.9-1.5 5.2c-1.1 1.2-2.4 1.8-4.1 1.8zm-.6-2.9c.9 0 1.6-.4 2.1-1.1.5-.7.8-1.8.8-3.1 0-1.4-.3-2.4-.8-3.2-.5-.8-1.2-1.1-2.1-1.1-.9 0-1.6.4-2.1 1.1-.5.7-.8 1.8-.8 3.2 0 1.3.3 2.4.8 3.1.5.8 1.2 1.1 2.1 1.1zm15.4 2.9c-1.5 0-2.8-.5-3.8-1.6-1-1.1-1.5-2.6-1.5-4.5 0-2 .5-3.6 1.6-4.7 1.1-1.1 2.4-1.7 4.1-1.7 1.7 0 3 .5 3.9 1.6 1 1.1 1.4 2.6 1.4 4.5v1.2H65.8c.1 1.1.4 2 .9 2.6.6.6 1.3.9 2.3.9 1.2 0 2.1-.4 2.6-1.2l2.3 1.7c-.8 1.4-2.2 2.2-4.1 2.2zm1.8-7.7c0-.9-.2-1.6-.7-2.1-.5-.5-1.1-.7-1.8-.7-.7 0-1.3.2-1.8.7-.5.5-.7 1.2-.8 2.1h5.1zm11.8 7.7c-1.6 0-2.9-.6-3.8-1.7v1.4h-3.3V11.5h3.3v1.8c.9-1.2 2.2-1.8 3.8-1.8 1.7 0 3.1.6 4.1 1.9 1 1.3 1.5 3 1.5 5.1s-.5 3.8-1.5 5.1c-1 1.3-2.4 1.9-4.1 1.9zm-.6-2.9c.9 0 1.6-.4 2.1-1.1.5-.7.8-1.8.8-3.1 0-1.4-.3-2.4-.8-3.2-.5-.8-1.2-1.1-2.1-1.1-.9 0-1.6.4-2.1 1.1-.5.7-.8 1.8-.8 3.2 0 1.3.3 2.4.8 3.1.5.8 1.2 1.1 2.1 1.1zm14.6 2.6c-.9.5-2.1.8-3.4.8-1.6 0-2.9-.5-3.8-1.5-.9-1-1.4-2.5-1.4-4.5 0-2 .5-3.6 1.5-4.7 1-1.1 2.4-1.7 4.1-1.7 1.2 0 2.2.3 3 .8l-.9 2.7c-.6-.4-1.3-.6-2-.6-1 0-1.8.4-2.3 1.1-.6.7-.8 1.8-.8 3.2 0 1.4.3 2.4.8 3.1.6.7 1.3 1.1 2.3 1.1.7 0 1.4-.2 2.1-.6l.9 2.6z" />
    </svg>
  );
}

// Icon Threads "@" tối giản dùng cho card sticker
function ThreadsAtIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.87 14.83c-.76.76-1.79 1.17-2.91 1.17-2.28 0-4.13-1.85-4.13-4.13 0-2.28 1.85-4.13 4.13-4.13 1.12 0 2.15.41 2.91 1.17l-1.28 1.28c-.42-.42-.99-.65-1.63-.65-1.28 0-2.33 1.05-2.33 2.33s1.05 2.33 2.33 2.33c.64 0 1.21-.23 1.63-.65l1.28 1.28z" />
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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ig-story-modal-title"
    >
      <div className="w-full max-w-4xl h-[88vh] max-h-[720px] bg-[#111111] border border-zinc-800/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200">
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
        <div className="flex-1 bg-black relative flex items-center justify-center p-4 overflow-hidden">
          {/* Logo chữ Instagram mờ thanh lịch ở góc trái */}
          <div className="absolute left-6 sm:left-12 top-8 sm:top-12 opacity-90 hidden sm:block pointer-events-none">
            <InstagramWordmark className="w-28 sm:w-36 text-white" />
          </div>

          {/* Khung mô phỏng màn hình Story (Aspect ~ 9:16) */}
          <div className="w-[280px] sm:w-[310px] h-[460px] sm:h-[510px] bg-gradient-to-b from-[#1c1c1e] via-[#141416] to-[#0d0d0e] rounded-[24px] p-3 flex flex-col justify-between relative shadow-2xl border border-zinc-800/80 overflow-hidden shrink-0">
            {/* Top Bar Story: Progress Line & User Header */}
            <div>
              {/* Progress bar mỏng màu trắng */}
              <div className="w-full h-0.5 bg-white/40 rounded-full overflow-hidden mb-2.5">
                <div className="h-full w-1/3 bg-white rounded-full" />
              </div>

              {/* Thông tin người đăng story (Current User) */}
              <div className="flex items-center gap-2">
                <img
                  src={currentUserAvatar}
                  alt={currentUsername}
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-700/80 shrink-0"
                />
                <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                  {currentUsername}
                </span>
                <span className="text-[11px] text-zinc-400 shrink-0">1s</span>
              </div>
            </div>

            {/* Trung tâm Story: Thread Post Sticker Card */}
            <div className="bg-[#18181a]/95 backdrop-blur-md border border-white/10 dark:border-zinc-800 rounded-2xl p-3 shadow-xl w-full max-w-[275px] mx-auto my-auto transition-transform hover:scale-[1.02]">
              {/* Header card: Tác giả bài viết & Logo Threads @ */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={authorAvatar}
                    alt={authorUsername}
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                    className="w-5 h-5 rounded-full object-cover border border-zinc-700 shrink-0"
                  />
                  <span className="text-xs font-bold text-white truncate">
                    {authorUsername}
                  </span>
                </div>
                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <ThreadsAtIcon className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Nội dung bài viết */}
              {postContent && (
                <p className="text-[11.5px] leading-relaxed text-zinc-200 line-clamp-5 whitespace-pre-line">
                  {postContent}
                </p>
              )}

              {/* Ảnh đính kèm (nếu có) */}
              {postMediaUrl && (
                <div className="mt-2 rounded-xl overflow-hidden max-h-32 bg-black/30 border border-zinc-800/80">
                  <img
                    src={postMediaUrl}
                    alt="attachment"
                    className="w-full h-full object-cover max-h-32"
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

            {/* Bottom Story: Thanh Reply Pill mô phỏng Instagram */}
            <div className="w-full h-7 rounded-full bg-white/10 border border-white/15 px-3 flex items-center justify-between text-[11px] text-white/50">
              <span>Send message</span>
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3" />
                <Send className="w-3 h-3" />
              </div>
            </div>
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
            className="px-6 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-70"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
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
