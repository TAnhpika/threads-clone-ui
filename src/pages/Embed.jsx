import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThreads } from '@fortawesome/free-brands-svg-icons';
import { Heart, MessageCircle, Repeat2, Send, Check } from 'lucide-react';
import { getPostByIdApi } from '@/services/postService';
import { getAuthorAvatar } from '@/utils/avatar';
import defaultAvatar from '@/assets/images/default-avatar.svg';

/**
 * Định dạng số lượt tương tác ngắn gọn kiểu Việt Nam: 3,2K, 1,5M
 * @param {number} num
 * @returns {string}
 */
function formatEmbedCount(num) {
  if (num === undefined || num === null) return '0';
  const val = Number(num);
  if (isNaN(val)) return '0';
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace('.', ',').replace(',0', '') + 'M';
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(1).replace('.', ',').replace(',0', '') + 'K';
  }
  return val.toLocaleString('vi-VN');
}

/**
 * Định dạng thời gian đăng chuẩn Embed Threads: HH:mm · DD-MM-YYYY
 * Ví dụ: 13:04 · 09-10-2026
 * @param {string|Date} dateString
 * @returns {string}
 */
function formatEmbedTimestamp(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} · ${day}-${month}-${year}`;
}

/**
 * Trang Embed độc lập nhúng trong thẻ <iframe>
 * Route: /:username/post/:postId/embed hoặc /@:username/post/:postId/embed
 */
export default function EmbedPage() {
  const { username: rawUsername, postId } = useParams();
  const cleanUsername = (rawUsername || '').replace(/^@/, '');

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    if (!postId) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    getPostByIdApi(postId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setPost(data);
          setIsFollowing(Boolean(data.author?.isFollowed));
        } else {
          setIsError(true);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch embed post:', err);
        if (isMounted) setIsError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const author = post?.author || {};
  const authorUsername = author.username || cleanUsername || 'user';
  const authorName = author.name || authorUsername;
  const authorAvatar = author.avatar || getAuthorAvatar(author);
  const isVerified = Boolean(author.isVerified);

  const postOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const postUrl = `${postOrigin}/@${authorUsername}/post/${postId || post?.id}`;
  const profileUrl = `${postOrigin}/@${authorUsername}`;

  const openOriginalPost = (e) => {
    e?.stopPropagation?.();
    window.open(postUrl, '_blank', 'noopener,noreferrer');
  };

  const openAuthorProfile = (e) => {
    e?.stopPropagation?.();
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleToggleFollow = (e) => {
    e?.stopPropagation?.();
    setIsFollowing((prev) => !prev);
  };

  // 1. Trạng thái Đang tải (Skeleton / Spinner)
  if (isLoading) {
    return (
      <div className="w-full bg-white text-black rounded-2xl p-5 border border-zinc-200 shadow-sm animate-pulse">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-200" />
            <div className="space-y-1.5">
              <div className="w-24 h-3.5 bg-zinc-200 rounded" />
              <div className="w-16 h-2.5 bg-zinc-100 rounded" />
            </div>
          </div>
          <div className="w-28 h-7 bg-zinc-100 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-full h-3 bg-zinc-200 rounded" />
          <div className="w-3/4 h-3 bg-zinc-200 rounded" />
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-100 flex gap-5">
          <div className="w-12 h-3 bg-zinc-100 rounded" />
          <div className="w-12 h-3 bg-zinc-100 rounded" />
          <div className="w-12 h-3 bg-zinc-100 rounded" />
        </div>
      </div>
    );
  }

  // 2. Trạng thái Lỗi khi không tìm thấy bài viết
  if (isError || !post) {
    return (
      <div className="w-full bg-white text-black rounded-2xl p-6 border border-zinc-200 shadow-sm text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
          <FontAwesomeIcon icon={faThreads} className="text-xl" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">
          Không thể tải bài viết này
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Bài viết có thể đã bị xóa hoặc đường dẫn không chính xác.
        </p>
        <button
          type="button"
          onClick={openOriginalPost}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>Xem trên Threads</span>
          <FontAwesomeIcon icon={faThreads} className="text-xs" />
        </button>
      </div>
    );
  }

  // Chuẩn bị dữ liệu hiển thị
  const content = post.content || '';
  const cleanContent =
    content === '.' || content === '\u3164' || content.trim() === '.' || content.trim() === '\u3164'
      ? ''
      : content;

  // Media
  const mediaList = Array.isArray(post.media?.urls)
    ? post.media.urls
    : post.media?.url
    ? [post.media.url]
    : Array.isArray(post.media_urls)
    ? post.media_urls
    : [];

  const timestampDisplay = formatEmbedTimestamp(post.createdAt || post.created_at);

  const likesCount = post.likes ?? 0;
  const commentsCount = post.comments ?? 0;
  const repostsCount = post.reposts ?? 0;
  const sharesCount = post.shares ?? 0;

  return (
    <article
      onClick={openOriginalPost}
      className="w-full bg-white text-black rounded-2xl p-4 sm:p-5 border border-zinc-200 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden select-none"
    >
      {/* 1. Header: Avatar + Tên người dùng + Theo dõi + Nút "Xem trên Threads" */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={openAuthorProfile}
            className="shrink-0 rounded-full focus:outline-none"
            title={`Xem trang cá nhân của ${authorUsername}`}
          >
            <img
              src={authorAvatar}
              alt={authorUsername}
              onError={(e) => {
                e.currentTarget.src = defaultAvatar;
              }}
              className="w-9 h-9 rounded-full object-cover border border-zinc-200 hover:opacity-90 transition-opacity"
            />
          </button>

          <div className="flex items-center gap-1.5 leading-tight truncate">
            <button
              type="button"
              onClick={openAuthorProfile}
              className="text-[15px] font-bold text-black truncate hover:underline text-left cursor-pointer"
            >
              {authorUsername}
            </button>

            {/* Huy hiệu xác minh (verified badge) */}
            {isVerified && (
              <span
                className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0"
                title="Đã xác minh"
              >
                <Check className="w-2.5 h-2.5 stroke-3.5" />
              </span>
            )}

            {/* Nút Theo dõi */}
            <span className="text-zinc-400 select-none">·</span>
            <button
              type="button"
              onClick={handleToggleFollow}
              className="text-sm font-semibold text-black hover:opacity-75 transition-opacity cursor-pointer shrink-0"
            >
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          </div>
        </div>

        {/* 5. Nút "Xem trên Threads" */}
        <button
          type="button"
          onClick={openOriginalPost}
          className="bg-zinc-100 hover:bg-zinc-200 active:scale-95 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-900 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-zinc-200/60"
          title="Xem bài viết gốc trên Threads"
        >
          <span>Xem trên Threads</span>
          <FontAwesomeIcon icon={faThreads} className="text-sm" />
        </button>
      </div>

      {/* 2. Nội dung bài viết (Text + Media nếu có) */}
      {cleanContent && (
        <p className="text-[14.5px] leading-relaxed my-3.5 whitespace-pre-line font-normal text-zinc-900 wrap-break-word">
          {cleanContent}
        </p>
      )}

      {/* Danh sách ảnh / video */}
      {mediaList.length > 0 && (
        <div
          className={`my-3 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 ${
            mediaList.length === 1 ? 'max-h-72 sm:max-h-80' : 'grid grid-cols-2 gap-1.5 max-h-72 sm:max-h-80'
          }`}
        >
          {mediaList.map((mediaUrl, idx) => {
            const isVideo =
              typeof mediaUrl === 'string' &&
              (mediaUrl.includes('.mp4') ||
                mediaUrl.includes('.webm') ||
                mediaUrl.includes('.mov') ||
                mediaUrl.startsWith('data:video/'));

            return isVideo ? (
              <video
                key={idx}
                src={mediaUrl}
                controls
                onClick={(e) => e.stopPropagation()}
                className="w-full h-full max-h-72 sm:max-h-80 object-cover bg-black"
              />
            ) : (
              <img
                key={idx}
                src={mediaUrl}
                alt="post media"
                className="w-full h-full max-h-72 sm:max-h-80 object-cover"
                loading="lazy"
              />
            );
          })}
        </div>
      )}

      {/* 3. Thời gian đăng bài */}
      {timestampDisplay && (
        <div className="text-xs text-zinc-500 font-normal mt-2.5">
          {timestampDisplay}
        </div>
      )}

      {/* 4. Thanh tương tác (InteractionBar: Tim, Bình luận, Repost, Share) */}
      <div className="flex items-center gap-4.5 text-xs text-zinc-600 font-medium mt-3 pt-3 border-t border-zinc-100">
        <span
          className="flex items-center gap-1.5 hover:text-black transition-colors"
          title={`${likesCount} lượt thích`}
        >
          <Heart className="w-3.5 h-3.5 stroke-2" />
          <span>{formatEmbedCount(likesCount)}</span>
        </span>

        <span
          className="flex items-center gap-1.5 hover:text-black transition-colors"
          title={`${commentsCount} bình luận`}
        >
          <MessageCircle className="w-3.5 h-3.5 stroke-2" />
          <span>{formatEmbedCount(commentsCount)}</span>
        </span>

        <span
          className="flex items-center gap-1.5 hover:text-black transition-colors"
          title={`${repostsCount} lượt đăng lại`}
        >
          <Repeat2 className="w-3.5 h-3.5 stroke-2" />
          <span>{formatEmbedCount(repostsCount)}</span>
        </span>

        <span
          className="flex items-center gap-1.5 hover:text-black transition-colors"
          title={`${sharesCount} lượt chia sẻ`}
        >
          <Send className="w-3.5 h-3.5 stroke-2" />
          <span>{formatEmbedCount(sharesCount)}</span>
        </span>
      </div>
    </article>
  );
}
