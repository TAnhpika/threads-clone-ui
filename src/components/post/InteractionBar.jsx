import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, MessageCircle, Repeat2, Send } from 'lucide-react';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { saveFeedScroll } from '@/features/feed/feedSlice';
import { usePostInteraction } from '@/hooks/usePostInteraction';
import RepostModal from './RepostModal';
import QuoteModal from './QuoteModal';
import ShareModal from './ShareModal';

export default function InteractionBar({
  initialLikes = 0,
  initialComments = 0,
  initialReposts = 0,
  initialShares = 0,
  initialIsLiked = false,
  initialIsReposted = false,
  postId,
  authorUsername,
  feedType = 'for_you',
  post,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const {
    isLiked,
    likes,
    toggleLike,
    isReposted,
    reposts,
    toggleRepost,
  } = usePostInteraction({
    postId,
    initialLikes,
    initialIsLiked,
    initialReposts,
    initialIsReposted,
    onToast: showToast,
    syncRedux: true,
  });

  const handleComment = (e) => {
    e?.stopPropagation?.();
    if (postId) {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      dispatch(
        saveFeedScroll({
          feedType,
          scrollPosition: currentScrollY,
          lastClickedPostId: postId,
        })
      );
      const username = authorUsername || 'user';
      navigate(`/@${username}/post/${postId}#reply`, { state: { focusReply: true } });
    }
  };

  const handleRepostClick = (e) => {
    e?.stopPropagation?.();
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'repost' } }));
      return;
    }
    setIsRepostModalOpen((prev) => !prev);
  };

  const handleShareClick = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-say-more'));
      return;
    }
    setIsShareModalOpen(true);
  };

  const handleQuote = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'repost' } }));
      return;
    }
    setIsRepostModalOpen(false);
    setIsQuoteModalOpen(true);
  };

  const handleFeedback = (msg) => {
    showToast(msg);
  };

  // Hàm format số lượng hiển thị (1200 -> 1,2K)
  const formatCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return count.toLocaleString('vi-VN');
  };

  return (
    <div className="relative flex items-center gap-1 sm:gap-2 mt-3 -ml-2 text-zinc-600 dark:text-zinc-400">
      {/* 1. Like Button */}
      <button
        onClick={toggleLike}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer group hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
          isLiked ? 'text-red-500' : 'hover:text-black dark:hover:text-white'
        }`}
        title={isLiked ? 'Bỏ thích' : 'Thích'}
      >
        <Heart
          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
            isLiked ? 'fill-red-500 stroke-red-500' : ''
          }`}
        />
        <span>{formatCount(likes)}</span>
      </button>

      {/* 2. Comment Button */}
      <button
        onClick={handleComment}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer group hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
        title="Bình luận"
      >
        <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span>{formatCount(initialComments)}</span>
      </button>

      {/* 3. Repost Button & Modal */}
      <div className="relative">
        <button
          onClick={handleRepostClick}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer group hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
            isReposted ? 'text-green-500' : 'hover:text-black dark:hover:text-white'
          }`}
          title={isReposted ? 'Hủy đăng lại' : 'Đăng lại'}
          aria-expanded={isRepostModalOpen}
        >
          <Repeat2
            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              isReposted ? 'stroke-green-500 stroke-2 text-green-500' : ''
            }`}
          />
          <span>{formatCount(reposts)}</span>
        </button>

        {/* Modal Repost / Quote */}
        {isAuthenticated && (
          <RepostModal
            isOpen={isRepostModalOpen}
            onClose={() => setIsRepostModalOpen(false)}
            isReposted={isReposted}
            onRepost={toggleRepost}
            onQuote={handleQuote}
          />
        )}
      </div>

      {/* 4. Share Button & Modal */}
      <div className="relative">
        <button
          onClick={handleShareClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer group hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
          title="Chia sẻ"
        >
          <Send className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>{formatCount(initialShares)}</span>
        </button>

        {/* Modal Share Post */}
        {isAuthenticated && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            post={post}
            postId={postId || post?.id}
            onActionFeedback={handleFeedback}
          />
        )}
      </div>

      {/* Modal Quote Post */}
      {isAuthenticated && (
        <QuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          quotedPost={post}
          feedType={feedType}
        />
      )}

      {/* Toast thông báo nhanh */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
