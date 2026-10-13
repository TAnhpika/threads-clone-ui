import { MoreHorizontal, CheckCircle2 } from 'lucide-react';

export default function PostHeader({
  author = {},
  timestamp = '2h',
  tag,
}) {
  const { name = 'Anonymous', username = 'user', avatar, isVerified = false } = author;

  return (
    <div className="flex items-center justify-between gap-3">
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

      {/* Nút tùy chọn More (...) */}
      <button
        className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
        title="Tùy chọn"
        aria-label="Tùy chọn bài viết"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
