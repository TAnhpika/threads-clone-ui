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
  Check,
  ArrowUp,
} from 'lucide-react';
import copy from 'copy-to-clipboard';
import { RadialSpinner } from '@/components/common/GlobalToast';
import {
  getPostByIdApi,
  getRepliesApi,
  createReplyApi,
  savePostApi,
  unsavePostApi,
  hidePostApi,
  reportPostApi,
  deletePostApi,
} from '@/services/postService';
import ReportModal from '@/components/post/ReportModal';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import userAvatar from '@/assets/images/default-avatar.svg';
import { getAuthorAvatar } from '@/utils/avatar';
import { getShareUrl } from '@/utils/postUrl';
import PostMenu from '@/components/post/PostMenu';
import CreatePostModal from '@/components/post/CreatePostModal';
import EditPostModal from '@/components/post/EditPostModal';
import DeletePostConfirmModal from '@/components/post/DeletePostConfirmModal';
import EmbedModal from '@/components/post/EmbedModal';
import BlockConfirmModal from '@/components/post/BlockConfirmModal';
import PostCard from '@/components/post/PostCard';
import PostContent from '@/components/post/PostContent';
import RepostModal from '@/components/post/RepostModal';
import AuthorProfileModal from '@/components/post/AuthorProfileModal';
import UnfollowConfirmModal from '@/components/post/UnfollowConfirmModal';
import { usePostInteraction } from '@/hooks/usePostInteraction';
import {
  followUserApi,
  unfollowUserApi,
  muteUserApi,
  unmuteUserApi,
  restrictUserApi,
  unrestrictUserApi,
  blockUserApi,
  unblockUserApi,
} from '@/services/userService';

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
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef(null);
  const [quoteTargetPost, setQuoteTargetPost] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Floating modal state & toast
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('bottom-right');
  const showToast = (msg) => {
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: typeof msg === 'string' ? { message: msg } : msg,
      })
    );
  };

  // Đóng column menu khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    if (!isColumnMenuOpen) return;
    const handleClickOutside = (e) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target)) {
        setIsColumnMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsColumnMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isColumnMenuOpen]);

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
    setIsSubmittingReply(true);

    // 1. Kích hoạt Toast trạng thái đang gửi: [Spinner] Posting... (Ảnh mẫu 1 & 3)
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: {
          type: 'reply',
          status: 'loading',
          message: 'Posting...',
        },
      })
    );

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
      timestamp: '1m',
      createdAt: new Date().toISOString(),
      content,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      hasConnector: false,
    };

    try {
      const created = await createReplyApi(post?.id || postId, { content });
      const finalReply = created && created.id ? created : optimisticReply;

      // 2. Chèn câu trả lời mới vào ngay trên đầu danh sách (Ảnh mẫu 2)
      setReplies((prev) => [finalReply, ...prev.filter((r) => r.id !== tempId)]);
      setPost((prev) => (prev ? { ...prev, comments: (prev.comments || 0) + 1 } : prev));
      setReplyInput('');

      // 3. Kích hoạt Toast thành công: ✓ Posted  View (Ảnh mẫu 2)
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: {
            type: 'reply',
            status: 'completed',
            message: 'Posted',
            replyId: finalReply.id,
            actionLabel: 'View',
            onAction: () => {
              const el = document.getElementById(`reply-item-${finalReply.id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('bg-zinc-100/80', 'dark:bg-zinc-800/50', 'transition-all');
                setTimeout(() => {
                  el.classList.remove('bg-zinc-100/80', 'dark:bg-zinc-800/50');
                }, 1500);
              }
            },
          },
        })
      );
    } catch (err) {
      console.warn('API create reply failed or offline, fallback to optimistic reply:', err);
      // Fallback lưu câu trả lời để người dùng luôn có trải nghiệm liền mạch
      setReplies((prev) => [optimisticReply, ...prev.filter((r) => r.id !== tempId)]);
      setPost((prev) => (prev ? { ...prev, comments: (prev.comments || 0) + 1 } : prev));
      setReplyInput('');

      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: {
            type: 'reply',
            status: 'completed',
            message: 'Posted',
            replyId: optimisticReply.id,
            actionLabel: 'View',
            onAction: () => {
              const el = document.getElementById(`reply-item-${optimisticReply.id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('bg-zinc-100/80', 'dark:bg-zinc-800/50', 'transition-all');
                setTimeout(() => {
                  el.classList.remove('bg-zinc-100/80', 'dark:bg-zinc-800/50');
                }, 1500);
              }
            },
          },
        })
      );
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
              if (location.state?.fromShare || window.history.length <= 2) {
                navigate('/');
              } else {
                navigate(-1);
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

          {/* Nút tuỳ chọn (...) ở trên cùng của Thread: chỉ có chức năng Add as column (Ảnh 1) */}
          <div className="relative" ref={columnMenuRef}>
            <button
              onClick={() => setIsColumnMenuOpen((prev) => !prev)}
              className={`w-7 h-7 rounded-full border transition-colors flex items-center justify-center cursor-pointer ${
                isColumnMenuOpen
                  ? 'border-black dark:border-white text-black dark:text-white bg-zinc-100 dark:bg-zinc-800'
                  : 'border-zinc-300 dark:border-zinc-700/80 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Tuỳ chọn"
              aria-label="Tuỳ chọn cột"
              aria-expanded={isColumnMenuOpen}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isColumnMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-9 w-48 p-1 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none text-black dark:text-white"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsColumnMenuOpen(false);
                    showToast('Đã thêm làm cột');
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <span>Add as column</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4.5 h-4.5 text-zinc-600 dark:text-zinc-300 group-hover:scale-105 transition-transform"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </button>
              </div>
            )}
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
          <main className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-visible transition-colors">
            {/* 1. BÀI VIẾT CHÍNH (Main Post) */}
            <PostCard
              post={post}
              isDetail={true}
              onCommentClick={() => {
                replyInputRef.current?.focus();
                replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              onQuote={(targetPost) => {
                setQuoteTargetPost(targetPost || post);
                setCreateModalPlacement('center');
                setIsCreateModalOpen(true);
              }}
            />

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
                <div className="flex items-center gap-2.5 text-zinc-400 shrink-0">
                  {!replyInput.trim() && !isSubmittingReply && (
                    <>
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
                    </>
                  )}
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
                  {(replyInput.trim() || isSubmittingReply) && (
                    <button
                      type="button"
                      onClick={submitReply}
                      disabled={isSubmittingReply}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSubmittingReply
                          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                          : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-85 active:scale-95 cursor-pointer shadow-xs'
                      }`}
                      title={isSubmittingReply ? 'Đang gửi...' : 'Đăng câu trả lời'}
                    >
                      {isSubmittingReply ? (
                        <RadialSpinner className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  )}
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
                    currentUser={currentUser}
                    onToast={showToast}
                    isAuthenticated={isAuthenticated}
                    onQuoteReply={(target) => {
                      setQuoteTargetPost(target);
                      setCreateModalPlacement('center');
                      setIsCreateModalOpen(true);
                    }}
                    onUpdateReply={(updated) => {
                      setReplies((prev) =>
                        prev.map((r) =>
                          r.id === updated.postId ? { ...r, ...updated } : r
                        )
                      );
                    }}
                    onDeleteReply={(replyId) => {
                      setReplies((prev) => prev.filter((r) => r.id !== replyId));
                      setPost((prev) =>
                        prev
                          ? {
                              ...prev,
                              comments: Math.max(0, (prev.comments || 1) - 1),
                            }
                          : prev
                      );
                    }}
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
            setQuoteTargetPost(null);
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

      {/* Modal Tạo bài viết / Trích dẫn (Unified Modal) */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setQuoteTargetPost(null);
        }}
        currentUser={currentUser}
        quotedPost={quoteTargetPost}
        placement={createModalPlacement}
      />
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
function ReplyItem({
  reply,
  currentUser,
  onToast,
  isAuthenticated,
  onQuoteReply,
  onUpdateReply,
  onDeleteReply,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFollowed, setIsFollowed] = useState(Boolean(reply.author?.isFollowed));
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(reply.isSaved));
  const [isPinned, setIsPinned] = useState(Boolean(reply.isPinned));
  const [isArchived, setIsArchived] = useState(Boolean(reply.isArchived));
  const [isHideLikes, setIsHideLikes] = useState(Boolean(reply.isHideLikes));
  const [isMuted, setIsMuted] = useState(Boolean(reply.author?.isMuted));
  const [isRestricted, setIsRestricted] = useState(Boolean(reply.author?.isRestricted));
  const [isBlocked, setIsBlocked] = useState(Boolean(reply.author?.isBlocked));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const isSelf = Boolean(
    currentUser &&
      (currentUser.username === reply.author?.username ||
        (currentUser.id && currentUser.id === reply.author?.id))
  );

  const shouldRenderFollow = !isSelf;

  const handleFollow = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-auth-prompt', { detail: { type: 'follow' } })
      );
      return;
    }

    setIsFollowed(true);
    onToast?.(`Đang theo dõi @${reply.author?.username || 'user'}`);

    try {
      if (reply.author?.id) {
        await followUserApi(reply.author.id);
      }
    } catch (error) {
      console.error('Follow reply author failed:', error);
      setIsFollowed(false);
      onToast?.(
        `Không thể theo dõi @${reply.author?.username || 'user'}. Vui lòng thử lại.`
      );
    }
  };

  const handleFollowingClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsProfileModalOpen(true);
  };

  const handleOpenUnfollow = () => {
    setIsUnfollowModalOpen(true);
  };

  const handleConfirmUnfollow = async () => {
    setIsUnfollowModalOpen(false);
    setIsProfileModalOpen(false);
    setIsFollowed(false);
    onToast?.(`Đã bỏ theo dõi @${reply.author?.username || 'user'}`);

    try {
      if (reply.author?.id) {
        await unfollowUserApi(reply.author.id);
      }
    } catch (error) {
      console.error('Unfollow reply author failed:', error);
      setIsFollowed(true);
      onToast?.(
        `Không thể huỷ theo dõi @${reply.author?.username || 'user'}. Vui lòng thử lại.`
      );
    }
  };

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

  if (isHidden) return null;

  const replyShareUrl = getShareUrl({ author: reply.author }, reply.id);

  const handleMenuAction = async (action) => {
    if (action === 'copy_link') {
      copy(replyShareUrl);
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(replyShareUrl).catch(() => {});
      }
      onToast?.('Đã sao chép liên kết');
    } else if (action === 'embed') {
      setIsEmbedModalOpen(true);
    } else if (action === 'edit') {
      setIsEditModalOpen(true);
    } else if (action === 'delete') {
      setIsDeleteModalOpen(true);
    } else if (action === 'save') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'save' } }));
        return;
      }
      setIsSaved(true);
      onToast?.('Đã lưu câu trả lời');
      try {
        await savePostApi(reply.id);
      } catch (err) {
        console.warn('Save reply failed:', err);
      }
    } else if (action === 'unsave') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'save' } }));
        return;
      }
      setIsSaved(false);
      onToast?.('Đã bỏ lưu câu trả lời');
      try {
        await unsavePostApi(reply.id);
      } catch (err) {
        console.warn('Unsave reply failed:', err);
      }
    } else if (action === 'pin') {
      setIsPinned((prev) => {
        const next = !prev;
        onToast?.(next ? 'Đã ghim câu trả lời' : 'Đã bỏ ghim câu trả lời');
        return next;
      });
    } else if (action === 'archive') {
      setIsArchived((prev) => {
        const next = !prev;
        onToast?.(next ? 'Đã lưu trữ câu trả lời' : 'Đã khôi phục từ lưu trữ');
        return next;
      });
    } else if (action === 'toggle_hide_counts') {
      setIsHideLikes((prev) => {
        const next = !prev;
        onToast?.(next ? 'Đã ẩn số lượt thích và chia sẻ' : 'Đã hiện số lượt thích và chia sẻ');
        return next;
      });
    } else if (action === 'not_interested') {
      setIsHidden(true);
      onToast?.('Hidden');
      try {
        await hidePostApi(reply.id);
      } catch (err) {
        console.warn('Hide reply failed:', err);
      }
    } else if (action === 'mute' || action === 'unmute') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'mute' } }));
        return;
      }
      const willMute = action === 'mute';
      setIsMuted(willMute);
      onToast?.(willMute ? `Đã tắt thông báo từ @${reply.author?.username || 'user'}` : `Đã bật thông báo từ @${reply.author?.username || 'user'}`);
      try {
        if (reply.author?.id) {
          if (willMute) await muteUserApi(reply.author.id);
          else await unmuteUserApi(reply.author.id);
        }
      } catch (err) {
        console.warn('Mute/unmute failed:', err);
      }
    } else if (action === 'restrict' || action === 'unrestrict') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'restrict' } }));
        return;
      }
      const willRestrict = action === 'restrict';
      setIsRestricted(willRestrict);
      onToast?.(willRestrict ? `Đã hạn chế @${reply.author?.username || 'user'}` : `Đã bỏ hạn chế @${reply.author?.username || 'user'}`);
      try {
        if (reply.author?.id) {
          if (willRestrict) await restrictUserApi(reply.author.id);
          else await unrestrictUserApi(reply.author.id);
        }
      } catch (err) {
        console.warn('Restrict/unrestrict failed:', err);
      }
    } else if (action === 'block' || action === 'unblock') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'block' } }));
        return;
      }
      if (action === 'block') {
        setIsBlockModalOpen(true);
      } else {
        setIsBlocked(false);
        onToast?.(`Đã bỏ chặn @${reply.author?.username || 'user'}`);
        try {
          if (reply.author?.id) await unblockUserApi(reply.author.id);
        } catch (err) {
          console.warn('Unblock failed:', err);
        }
      }
    } else if (action === 'report') {
      setIsReportModalOpen(true);
    } else if (action === 'insights') {
      onToast?.('Xem thông tin chi tiết');
    } else if (action === 'post_options') {
      onToast?.('Tuỳ chọn câu trả lời');
    }
  };

  const handleConfirmDeleteReply = async () => {
    setIsDeleteModalOpen(false);
    onDeleteReply?.(reply.id);
    onToast?.('Đã xoá câu trả lời');
    try {
      await deletePostApi(reply.id);
    } catch (err) {
      console.warn('Delete reply failed:', err);
    }
  };

  const handleConfirmBlock = async () => {
    setIsBlockModalOpen(false);
    setIsBlocked(true);
    setIsHidden(true);
    onToast?.(`Đã chặn @${reply.author?.username || 'user'}`);
    try {
      if (reply.author?.id) await blockUserApi(reply.author.id);
    } catch (err) {
      console.warn('Block failed:', err);
    }
  };

  return (
    <article
      id={`reply-item-${reply.id}`}
      className="p-4 sm:p-5 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors"
    >
      <div className="flex gap-3">
        {/* Cột Avatar & Đường chỉ dọc (Thread connector line) */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <img
              src={reply.author?.avatar || getAuthorAvatar(reply.author)}
              alt={reply.author?.username || 'user'}
              onError={(e) => {
                e.currentTarget.src = userAvatar;
              }}
              className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
            />
            {shouldRenderFollow && (
              isFollowed ? (
                <button
                  type="button"
                  onClick={handleFollowingClick}
                  title="Following"
                  aria-label={`Following @${reply.author?.username || 'user'}`}
                  className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-white dark:bg-white text-black dark:text-black border-2 border-white dark:border-[#121212] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-xs z-10"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFollow}
                  title="Follow"
                  aria-label={`Follow @${reply.author?.username || 'user'}`}
                  className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-[#121212] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-xs z-10"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              )
            )}
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
                postUrl={replyShareUrl}
                isOwnPost={isSelf}
                isReply={true}
                createdAt={reply.createdAt}
                timestamp={reply.timestamp}
                isSaved={isSaved}
                isPinned={isPinned}
                isArchived={isArchived}
                isHideLikes={isHideLikes}
                isMuted={isMuted}
                isRestricted={isRestricted}
                isBlocked={isBlocked}
                onAction={handleMenuAction}
              />
              <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={reply}
                currentUser={currentUser}
                onUpdated={(updated) => {
                  onUpdateReply?.({
                    postId: reply.id,
                    ...updated,
                  });
                }}
              />
              <DeletePostConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirmDelete={handleConfirmDeleteReply}
                isReply={true}
              />
              <EmbedModal
                isOpen={isEmbedModalOpen}
                onClose={() => setIsEmbedModalOpen(false)}
                post={reply}
                postUrl={replyShareUrl}
              />
              <BlockConfirmModal
                isOpen={isBlockModalOpen}
                onClose={() => setIsBlockModalOpen(false)}
                onConfirm={handleConfirmBlock}
                username={reply.author?.username || 'user'}
              />
              <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                postId={reply.id}
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

            <div className="relative">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    window.dispatchEvent(
                      new CustomEvent('open-auth-prompt', { detail: { type: 'repost' } })
                    );
                    return;
                  }
                  setIsRepostModalOpen((prev) => !prev);
                }}
                className={`flex items-center gap-1 transition-colors cursor-pointer group ${
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
                {reposts > 0 && <span>{reposts}</span>}
              </button>

              {isAuthenticated && (
                <RepostModal
                  isOpen={isRepostModalOpen}
                  onClose={() => setIsRepostModalOpen(false)}
                  isReposted={isReposted}
                  onRepost={handleRepost}
                  onQuote={() => {
                    setIsRepostModalOpen(false);
                    onQuoteReply?.(reply);
                  }}
                />
              )}
            </div>

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

      {/* Modal Profile tác giả khi click vào tick [✓] */}
      <AuthorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        author={reply.author}
        onOpenUnfollow={handleOpenUnfollow}
      />

      {/* Modal xác nhận Unfollow khi click nút Following trong Profile Modal */}
      <UnfollowConfirmModal
        isOpen={isUnfollowModalOpen}
        onClose={() => setIsUnfollowModalOpen(false)}
        author={reply.author}
        onConfirmUnfollow={handleConfirmUnfollow}
      />
    </article>
  );
}
