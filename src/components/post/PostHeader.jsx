import { useState } from 'react';
import { MoreHorizontal, CheckCircle2 } from 'lucide-react';
import PostMenu from './PostMenu';

export default function PostHeader({
  author = {},
  timestamp = '2h',
  tag,
  postId,
}) {
  const { name = 'Anonymous', username = 'user', avatar, isVerified = false } = author;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleAction = (action) => {
    if (action === 'copy_link') {
      setToastMessage('Đã sao chép liên kết vào bộ nhớ tạm');
      setTimeout(() => setToastMessage(null), 2500);
    } else if (action === 'save') {
      setToastMessage('Đã lưu bài viết');
      setTimeout(() => setToastMessage(null), 2500);
    } else if (action === 'create_feed') {
      window.dispatchEvent(new CustomEvent('open-create-feed'));
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 relative">
      {/* Thông tin tác giả & thời gian */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={name}
            className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
            loading="lazy"
          />
        </div>

        {/* Tên, Verified & Thời gian */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="font-bold text-sm text-black dark:text-white hover:underline cursor-pointer truncate">
            {username}
          </span>

          {isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
          )}

          {tag && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0">
              <span>›</span>
              <span className="font-medium hover:underline cursor-pointer">{tag}</span>
            </span>
          )}

          <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
            · {timestamp}
          </span>
        </div>
      </div>

      {/* Nút tùy chọn More (...) & Menu Modal */}
      <div className="relative shrink-0">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            isMenuOpen
              ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
              : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title="Tùy chọn"
          aria-label="Tùy chọn bài viết"
          aria-expanded={isMenuOpen}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Post Menu Modal / Dropdown */}
        <PostMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onAction={handleAction}
        />
      </div>

      {/* Toast thông báo tương tác nhanh */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

