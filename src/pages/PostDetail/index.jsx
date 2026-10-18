import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Maximize2,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Plus,
} from 'lucide-react';
import { getPostByIdApi, getRepliesApi, createReplyApi } from '@/services/postService';
import { usePostInteraction } from '@/hooks/usePostInteraction';
import PostContent from '@/components/post/PostContent';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import userAvatar from '@/assets/images/ava.png';
import PostMenu from '@/components/post/PostMenu';
import CreatePostModal from '@/components/post/CreatePostModal';

export default function PostDetailPage() {
  const { username, postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const replyInputRef = useRef(null);

  // States dữ liệu bài viết và bình luận
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Menu và input states
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Floating modal state & toast
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('bottom-right');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Quản lý tương tác Like & Repost bài viết chính qua Hook tái sử dụng
  const {
    isLiked,
    likes,
    toggleLike: handleLikePost,
    isReposted,
    reposts,
    toggleRepost: handleRepostPost,
  } = usePostInteraction({
    postId: post?.id || postId,
    initialLikes: post?.likes || 0,
    initialIsLiked: post?.isLiked || false,
    initialReposts: post?.reposts || 0,
    initialIsReposted: post?.isReposted || false,
    onToast: showToast,
    syncRedux: true,
  });

  // Tải chi tiết bài viết và danh sách bình luận từ API
  useEffect(() => {
    if (!postId) return;
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    Promise.allSettled([
      getPostByIdApi(postId),
      getRepliesApi(postId),
    ]).then(([postRes, repliesRes]) => {
      if (!isMounted) return;

      if (postRes.status === 'fulfilled' && postRes.value) {
        setPost(postRes.value);
      } else {
        setIsError(true);
      }

      if (repliesRes.status === 'fulfilled' && Array.isArray(repliesRes.value)) {
        setReplies(repliesRes.value);
      } else {
        setReplies([]);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  // Tự động focus vào ô nhập bình luận khi click từ nút comment (có hash #reply hoặc state.focusReply)
  useEffect(() => {
    if (!isLoading && post) {
      const shouldFocus = location.hash === '#reply' || location.state?.focusReply;
      if (shouldFocus) {
        const timer = setTimeout(() => {
          replyInputRef.current?.focus();
          replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, post, location.hash, location.state]);

  // Thêm câu trả lời mới
  const handleAddReply = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitReply();
    }
  };

  const submitReply = async () => {
    if (!replyInput.trim() || isSubmittingReply) return;
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'comment' } }));
      return;
    }

    const content = replyInput.trim();
    setReplyInput('');
    setIsSubmittingReply(true);

    const tempId = `reply-${Date.now()}`;
    const optimisticReply = {
      id: tempId,
      author: {
        id: currentUser?.id,
        name: currentUser?.name || currentUser?.username || 'User',
        username: currentUser?.username || 'user',
        avatar: currentUser?.avatar || userAvatar,
        isVerified: false,
        isAuthor: currentUser?.username === post?.author?.username,
      },
      timestamp: 'vừa xong',
      content,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      hasConnector: false,
    };

    // Optimistic UI update
    setReplies((prev) => [optimisticReply, ...prev]);
    setPost((prev) => (prev ? { ...prev, comments: (prev.comments || 0) + 1 } : prev));

    try {
      const created = await createReplyApi(post?.id || postId, { content });
      if (created && created.id) {
        setReplies((prev) => prev.map((r) => (r.id === tempId ? created : r)));
      }
      showToast('Đã gửi câu trả lời ✨');
    } catch (err) {
      console.warn('API create reply not available or failed:', err);
      showToast('Đã lưu phản hồi');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="flex justify-center items-start w-full relative">
      <div className="w-full max-w-155 min-w-0">
        {/* Top Header: ← Back | Thread | More (...) */}
        <header className="relative flex items-center justify-between py-2 px-1 mb-2 select-none">
          {/* Nút quay lại */}
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="p-1.5 -ml-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Quay lại"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Tiêu đề căn giữa */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <h1 className="text-base font-bold text-black dark:text-white leading-tight">
              Thread
            </h1>
          </div>

          {/* Nút tuỳ chọn (...) hình tròn viền mỏng bên phải */}
          <div className="relative">
            <button
              onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
              className="w-7 h-7 rounded-full border border-zinc-300 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Tuỳ chọn"
              aria-label="Tuỳ chọn"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <PostMenu
              isOpen={isHeaderMenuOpen}
              onClose={() => setIsHeaderMenuOpen(false)}
              onAction={(action) => {
                if (action === 'copy_link') showToast('Đã sao chép liên kết');
                if (action === 'save') showToast('Đã lưu bài viết');
              }}
            />
          </div>
        </header>

        {/* Trạng thái tải bài viết: Skeleton loading */}
        {isLoading && <PostDetailSkeleton />}

        {/* Trạng thái lỗi: Không tìm thấy bài viết */}
        {!isLoading && (isError || !post) && (
          <PostNotFound onGoHome={() => navigate('/')} />
        )}

        {/* Khung Card chính chứa bài viết gốc và toàn bộ chuỗi replies */}
        {!isLoading && post && (
          <main className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden transition-colors">
            {/* 1. BÀI VIẾT CHÍNH (Main Post) */}
            <article className="p-4 sm:p-5">
              {/* Header tác giả */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar có badge follow dấu cộng [+] */}
                  <div className="relative shrink-0">
                    <img
                      src={post.author?.avatar || userAvatar}
                      alt={post.author?.username || 'user'}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-black border border-zinc-700 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                      <Plus className="w-3 h-3 stroke-3" />
                    </div>
                  </div>

                  {/* Username + Category/Tag + Thời gian */}
                  <div className="flex items-center gap-1.5 min-w-0 text-sm">
                    <span className="font-bold text-black dark:text-white hover:underline cursor-pointer truncate">
                      {post.author?.username || username || 'user'}
                    </span>
                    {post.tag && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0">
                        <span>›</span>
                        <span className="font-medium hover:underline cursor-pointer">
                          {post.tag}
                        </span>
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                      {post.timestamp}
                    </span>
                  </div>
                </div>

                {/* Nút More (...) của bài viết */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsPostMenuOpen((prev) => !prev)}
                    className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Tuỳ chọn bài viết"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <PostMenu
                    isOpen={isPostMenuOpen}
                    onClose={() => setIsPostMenuOpen(false)}
                    onAction={(action) => {
                      if (action === 'copy_link') showToast('Đã sao chép liên kết');
                      if (action === 'save') showToast('Đã lưu bài viết');
                    }}
                  />
                </div>
              </div>

              {/* Nội dung bài viết (Text + Media/GIF) */}
              <div className="mt-3">
                <PostContent text={post.content} media={post.media} />
              </div>

              {/* Thanh tương tác bài viết chính: Heart | Comment | Repost | Share */}
              <div className="flex items-center gap-4 sm:gap-6 mt-4 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                {/* Like */}
                <button
                  onClick={handleLikePost}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
                    isLiked ? 'text-red-500' : 'hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Heart
                    className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                      isLiked ? 'fill-red-500 stroke-red-500' : ''
                    }`}
                  />
                  <span>{likes}</span>
                </button>

                {/* Comment */}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.dispatchEvent(
                        new CustomEvent('open-auth-prompt', { detail: { type: 'comment' } })
                      );
                      return;
                    }
                    replyInputRef.current?.focus();
                  }}
                  className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer group"
                >
                  <MessageCircle className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                  <span>{post.comments || replies.length}</span>
                </button>

                {/* Repost */}
                <button
                  onClick={handleRepostPost}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
                    isReposted ? 'text-green-500' : 'hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Repeat2
                    className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                      isReposted ? 'stroke-green-500 stroke-2' : ''
                    }`}
                  />
                  <span>{reposts}</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.dispatchEvent(new CustomEvent('open-say-more'));
                      return;
                    }
                    navigator.clipboard?.writeText(window.location.href);
                    showToast('Đã sao chép liên kết để chia sẻ');
                  }}
                  className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer group"
                >
                  <Send className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                  <span>{post.shares || 0}</span>
                </button>
              </div>
            </article>

            {/* 2. DẢI BỘ LỌC 'Top ⌵' & 'View activity ›' */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <button className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Top</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => showToast('Xem chi tiết hoạt động của bài viết')}
                className="flex items-center gap-0.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-300 transition-colors cursor-pointer font-normal"
              >
                <span>View activity</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. KHUNG SOẠN THẢO TRẢ LỜI (Reply Input Pill) */}
            <div className="px-4 sm:px-5 pb-3">
              <div className="flex items-center gap-3 bg-zinc-100/90 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-zinc-800/90 rounded-full px-4 py-2 transition-colors focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
                <img
                  src={currentUser?.avatar || userAvatar}
                  alt="user"
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-300 dark:border-zinc-700"
                />
                <input
                  ref={replyInputRef}
                  id="thread-reply-input"
                  type="text"
                  placeholder={`Reply to ${post.author?.username || username || 'user'}...`}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  onKeyDown={handleAddReply}
                  disabled={isSubmittingReply}
                  onFocus={(e) => {
                    if (!isAuthenticated) {
                      e.target.blur();
                      window.dispatchEvent(
                        new CustomEvent('open-auth-prompt', { detail: { type: 'comment' } })
                      );
                    }
                  }}
                  className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder-zinc-500 outline-none"
                />
                <div className="flex items-center gap-3 text-zinc-400 shrink-0">
                  <button
                    type="button"
                    title="Thêm ảnh"
                    onClick={() => showToast('Chọn hình ảnh')}
                    className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4.5 h-4.5" />
                  </button>
                  <button
                    type="button"
                    title="Thêm GIF"
                    onClick={() => showToast('Chọn GIF')}
                    className="text-[11px] font-bold border border-zinc-400 dark:border-zinc-600 rounded px-1 py-0.5 leading-none hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors cursor-pointer"
                  >
                    GIF
                  </button>
                  <button
                    type="button"
                    title="Mở rộng"
                    onClick={() => {
                      setCreateModalPlacement('center');
                      setIsCreateModalOpen(true);
                    }}
                    className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. DANH SÁCH BÌNH LUẬN (Replies List) */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {replies.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
                  Chưa có câu trả lời nào. Hãy là người đầu tiên trả lời!
                </div>
              ) : (
                replies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    onToast={showToast}
                    isAuthenticated={isAuthenticated}
                  />
                ))
              )}
            </div>
          </main>
        )}
      </div>

      {/* Nút outline sổ ghi chép [+] ở mép phải */}
      {isAuthenticated && (
        <button
          onClick={() => {
            setCreateModalPlacement('bottom-right');
            setIsCreateModalOpen(true);
          }}
          className="fixed right-6 sm:right-8 top-1/2 -translate-y-1/2 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors z-40 cursor-pointer hidden lg:block"
          title="Tạo Thread mới"
          aria-label="Tạo Thread mới"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[1.8]">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M8 3v18" />
            <path d="M15 9v6" />
            <path d="M12 12h6" />
          </svg>
        </button>
      )}

      {/* Nút nổi vuông bo góc dấu cộng [+] ở góc dưới bên phải */}
      {isAuthenticated && (
        <button
          id="floating-new-thread-btn"
          onClick={() => {
            setCreateModalPlacement('bottom-right');
            setIsCreateModalOpen(true);
          }}
          className="fixed bottom-6 right-6 sm:right-8 w-14 h-14 rounded-2xl bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
          title="Tạo Thread mới"
          aria-label="Tạo Thread mới"
        >
          <Plus className="w-7 h-7 stroke-[2.2]" />
        </button>
      )}

      {/* Modal tạo bài viết */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onSubmitPost={() => {
          showToast('Đã đăng bài viết mới thành công ✨');
        }}
        placement={createModalPlacement}
      />

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs sm:text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// Skeleton loading cho trang chi tiết bài viết
function PostDetailSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-28" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
      </div>
      <div className="mt-5 flex gap-6 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

// Giao diện khi không tìm thấy bài viết
function PostNotFound({ onGoHome }) {
  return (
    <div className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl p-8 text-center flex flex-col items-center justify-center my-6">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
        <MessageCircle className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-bold text-black dark:text-white mb-1">
        Không tìm thấy bài viết
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-5">
        Bài viết này có thể không tồn tại hoặc đã bị gỡ bỏ bởi tác giả.
      </p>
      <button
        onClick={onGoHome}
        className="px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
      >
        Quay lại trang chủ
      </button>
    </div>
  );
}

// Component từng dòng Reply trong chuỗi phản hồi
function ReplyItem({ reply, onToast, isAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    isLiked,
    likes,
    toggleLike: handleLike,
    isReposted,
    reposts,
    toggleRepost: handleRepost,
  } = usePostInteraction({
    postId: reply?.id,
    initialLikes: reply?.likes || 0,
    initialIsLiked: reply?.isLiked || false,
    initialReposts: reply?.reposts || 0,
    initialIsReposted: reply?.isReposted || false,
    onToast,
    syncRedux: false,
  });

  return (
    <article className="p-4 sm:p-5 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors">
      <div className="flex gap-3">
        {/* Cột Avatar & Đường chỉ dọc (Thread connector line) */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <img
              src={reply.author?.avatar || userAvatar}
              alt={reply.author?.username || 'user'}
              className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
            />
            <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-black border border-zinc-700 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
              <Plus className="w-3 h-3 stroke-3" />
            </div>
          </div>
          {reply.hasConnector && (
            <div className="w-0.5 bg-zinc-200 dark:bg-zinc-800 flex-1 my-1.5 rounded-full" />
          )}
        </div>

        {/* Nội dung câu trả lời */}
        <div className="flex-1 min-w-0">
          {/* Tên người trả lời, badge tác giả, thời gian & More */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="font-bold text-sm text-black dark:text-white hover:underline cursor-pointer truncate">
                {reply.author?.username || 'user'}
              </span>

              {reply.author?.isAuthor && (
                <span className="px-1.5 py-0.5 text-[11px] font-semibold text-blue-500 bg-blue-500/10 rounded-full leading-none">
                  Author
                </span>
              )}

              <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                {reply.timestamp}
              </span>

              {reply.hasHeartBadge && (
                <span className="inline-flex items-center text-red-500 ml-1 text-xs">
                  ❤️
                </span>
              )}
            </div>

            {/* Nút tuỳ chọn (...) của reply */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Tuỳ chọn"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <PostMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onAction={(action) => {
                  if (action === 'copy_link') onToast('Đã sao chép liên kết');
                  if (action === 'save') onToast('Đã lưu câu trả lời');
                }}
              />
            </div>
          </div>

          {/* Nội dung phản hồi */}
          <div className="mt-1.5 text-sm sm:text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100">
            <p className="whitespace-pre-line inline">{reply.content}</p>
            {reply.media && (
              <div className="mt-2">
                <PostContent media={reply.media} />
              </div>
            )}
            <button
              onClick={() => onToast('Đã dịch sang Tiếng Việt')}
              className="text-xs text-zinc-500 hover:underline cursor-pointer ml-1.5 inline font-normal"
            >
              Translate
            </button>
          </div>

          {/* Thanh tương tác nhỏ của Reply */}
          <div className="flex items-center gap-4 sm:gap-5 mt-2.5 text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors cursor-pointer group ${
                isLiked ? 'text-red-500' : 'hover:text-black dark:hover:text-white'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isLiked ? 'fill-red-500 stroke-red-500' : ''
                }`}
              />
              {likes > 0 && <span>{likes}</span>}
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  window.dispatchEvent(
                    new CustomEvent('open-auth-prompt', { detail: { type: 'comment' } })
                  );
                  return;
                }
                const input = document.getElementById('thread-reply-input');
                input?.focus();
              }}
              className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors cursor-pointer group"
            >
              <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              {reply.comments > 0 && <span>{reply.comments}</span>}
            </button>

            <button
              onClick={handleRepost}
              className={`flex items-center gap-1 transition-colors cursor-pointer group ${
                isReposted ? 'text-green-500' : 'hover:text-black dark:hover:text-white'
              }`}
            >
              <Repeat2
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isReposted ? 'stroke-green-500 stroke-2' : ''
                }`}
              />
              {reposts > 0 && <span>{reposts}</span>}
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  window.dispatchEvent(new CustomEvent('open-say-more'));
                  return;
                }
                onToast('Đã sao chép liên kết để chia sẻ');
              }}
              className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors cursor-pointer group"
            >
              <Send className="w-4 h-4 transition-transform group-hover:scale-110" />
              {reply.shares > 0 && <span>{reply.shares}</span>}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
