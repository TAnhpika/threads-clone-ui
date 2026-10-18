import userAvatar from '@/assets/images/default-avatar.svg';
import { getAuthorAvatar } from '@/utils/avatar';

/**
 * Component hiển thị preview của bài viết được trích dẫn (Quoted Post).
 * Được tái sử dụng ở:
 * 1. Bên trong QuoteModal khi người dùng đang soạn bài trích dẫn.
 * 2. Bên trong PostCard / PostDetail sau khi bài viết trích dẫn được xuất bản trên Feed.
 */
export default function QuotedPostCard({ post, onTranslate }) {
  if (!post) return null;

  const author = post.author || post.user || {};
  const avatarUrl = author.avatar || author.avatar_url || getAuthorAvatar(author);
  const username = author.username || author.name || 'user';
  const timestamp = post.timestamp || '17h';
  const content = post.content || '';
  const mediaUrl = post.media?.url || (Array.isArray(post.media_urls) ? post.media_urls[0] : null);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800/90 rounded-2xl p-3.5 bg-zinc-50/60 dark:bg-[#181818]/70 text-black dark:text-white transition-colors">
      {/* 1. Header tác giả bài gốc */}
      <div className="flex items-center gap-2 mb-1.5 min-w-0">
        <img
          src={avatarUrl}
          alt={username}
          onError={(e) => {
            e.currentTarget.src = userAvatar;
          }}
          className="w-5 h-5 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
        />
        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer truncate">
          {username}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
          {timestamp}
        </span>
      </div>

      {/* 2. Nội dung bài gốc */}
      {content && (
        <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line line-clamp-3">
          {content}
        </p>
      )}

      {/* 3. Link Translate (nếu có) */}
      <div className="mt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTranslate?.();
          }}
          className="text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-200 hover:underline cursor-pointer"
        >
          Translate
        </button>
      </div>

      {/* 4. Hình ảnh đính kèm (nếu bài gốc có media) */}
      {mediaUrl && (
        <div className="mt-2.5 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-44 bg-black/10">
          <img
            src={mediaUrl}
            alt="Quoted media"
            className="w-full h-full object-cover max-h-44"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
