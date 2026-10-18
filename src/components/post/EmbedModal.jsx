import { useState, useEffect } from 'react';
import copy from 'copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThreads } from '@fortawesome/free-brands-svg-icons';
import { Check, Copy, Heart, MessageCircle, Repeat2, Send } from 'lucide-react';
import defaultAvatar from '@/assets/images/default-avatar.svg';
import { getAuthorAvatar } from '@/utils/avatar';

export default function EmbedModal({
  isOpen,
  onClose,
  post,
  postId,
  onSuccessFeedback,
}) {
  const [isCopied, setIsCopied] = useState(false);

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
      setIsCopied(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const author = post.author || post.user || {};
  const authorUsername = author.username || 'user';
  const authorAvatar = author.avatar || getAuthorAvatar(author);
  const postContent = post.content || '';
  const postTimestamp = post.timestamp || '6:07 PM · Oct 17, 2026';
  const postMediaUrl =
    post.media?.url ||
    (Array.isArray(post.media_urls) && post.media_urls[0]) ||
    (Array.isArray(post.media?.urls) && post.media.urls[0]) ||
    null;

  const likesCount = post.likes ?? 594;
  const commentsCount = post.comments ?? 74;
  const repostsCount = post.reposts ?? 34;
  const sharesCount = post.shares ?? 23;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://threads.net';
  const currentPostId = postId || post?.id || 'DiyNUECS0k';
  const embedUrl = `${origin}/${authorUsername}/post/${currentPostId}/embed`;
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`;

  const handleCopyCode = () => {
    copy(iframeSnippet);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(iframeSnippet).catch(() => {});
    }
    setIsCopied(true);
    if (onSuccessFeedback) {
      onSuccessFeedback('Đã sao chép mã nhúng vào bộ nhớ tạm 📋');
    }
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleViewOnThreads = () => {
    const postUrl = `/${authorUsername}/post/${currentPostId}`;
    window.open(postUrl, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="embed-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[540px] bg-[#1c1c1e] border border-zinc-800 rounded-[28px] shadow-2xl p-4 sm:p-6 text-white animate-in zoom-in-95 duration-150 flex flex-col gap-4 relative"
      >
        {/* 1. Preview Card chuẩn mẫu Threads (Nền trắng, chữ đen) */}
        <div className="w-full bg-white text-black rounded-2xl p-5 shadow-lg border border-zinc-200">
          {/* Header Preview: Avatar + Username + · Follow + Nút View on Threads */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={authorAvatar}
                alt={authorUsername}
                onError={(e) => {
                  e.currentTarget.src = defaultAvatar;
                }}
                className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
              />
              <div className="flex items-center gap-1.5 leading-tight truncate">
                <span className="text-[15px] font-bold text-black truncate">
                  {authorUsername}
                </span>
                <span className="text-sm font-semibold text-black hover:underline cursor-pointer shrink-0">
                  · Follow
                </span>
              </div>
            </div>

            {/* Nút View on Threads có icon @ Threads */}
            <button
              type="button"
              onClick={handleViewOnThreads}
              className="bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-900 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <span>View on Threads</span>
              <FontAwesomeIcon icon={faThreads} className="text-sm" />
            </button>
          </div>

          {/* Nội dung bài viết */}
          {postContent && (
            <p className="text-[14.5px] leading-relaxed my-3.5 whitespace-pre-line font-normal text-zinc-900">
              {postContent}
            </p>
          )}

          {/* Ảnh đính kèm (nếu có) */}
          {postMediaUrl && (
            <div className="my-3 rounded-xl overflow-hidden max-h-64 bg-zinc-100 border border-zinc-200">
              <img
                src={postMediaUrl}
                alt="attachment"
                className="w-full h-full object-cover max-h-64"
              />
            </div>
          )}

          {/* Thời gian đăng */}
          <div className="text-xs text-zinc-500 font-normal mt-1">
            {postTimestamp}
          </div>

          {/* Dải số liệu tương tác */}
          <div className="flex items-center gap-4 text-xs text-zinc-600 font-medium mt-3 pt-3 border-t border-zinc-100">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 stroke-[2]" />
              {likesCount}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 stroke-[2]" />
              {commentsCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Repeat2 className="w-3.5 h-3.5 stroke-[2]" />
              {repostsCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 stroke-[2]" />
              {sharesCount}
            </span>
          </div>
        </div>

        {/* 2. Khung chứa Code Embed và Nút Copy */}
        <div className="bg-[#101012] border border-zinc-750 rounded-2xl p-2.5 pl-4 flex items-center justify-between gap-3 shadow-inner">
          <code className="font-mono text-xs text-zinc-300 truncate select-all">
            {iframeSnippet}
          </code>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md active:scale-95"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Copied
              </>
            ) : (
              'Copy'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
