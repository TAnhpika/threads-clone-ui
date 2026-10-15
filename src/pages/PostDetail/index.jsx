import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { mockPosts } from '@/components/post/mockPosts';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import userAvatar from '@/assets/images/ava.png';
import PostMenu from '@/components/post/PostMenu';
import CreatePostModal from '@/components/post/CreatePostModal';

export default function PostDetailPage() {
  const { username, postId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Tìm bài viết theo postId hoặc username hoặc dùng mặc định bài DeZUpPAj_q6
  const post = useMemo(() => {
    const cleanUsername = username?.startsWith('@') ? username.slice(1) : username;
    return (
      mockPosts.find((p) => p.id === postId) ||
      mockPosts.find(
        (p) => p.author?.username === cleanUsername || p.author?.username === username
      ) ||
      mockPosts[0]
    );
  }, [postId, username]);

  // State tương tác của bài viết chính
  const [likes, setLikes] = useState(post.likes || 194);
  const [isLiked, setIsLiked] = useState(false);
  const [reposts, setReposts] = useState(post.reposts || 13);
  const [isReposted, setIsReposted] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);

  // State danh sách bình luận (Replies)
  const [replies, setReplies] = useState(post.replies || []);
  const [replyInput, setReplyInput] = useState('');

  // Floating modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('bottom-right');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleLikePost = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'like' } }));
      return;
    }
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleRepostPost = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'repost' } }));
      return;
    }
    if (isReposted) {
      setReposts((prev) => prev - 1);
      setIsReposted(false);
      showToast('Đã hủy đăng lại');
    } else {
      setReposts((prev) => prev + 1);
      setIsReposted(true);
      showToast('Đã đăng lại bài viết');
    }
  };

  // Thêm câu trả lời mới
  const handleAddReply = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitReply();
    }
  };

  const submitReply = () => {
    if (!replyInput.trim()) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      author: {
        name: currentUser?.name || 'tuananhpika',
        username: currentUser?.username || 'tuananhpika',
        avatar: currentUser?.avatar || userAvatar,
        isVerified: false,
      },
      timestamp: 'Vừa xong',
      content: replyInput.trim(),
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      hasConnector: false,
    };

    setReplies((prev) => [...prev, newReply]);
    setReplyInput('');
    showToast('Đã gửi câu trả lời');
  };

  return (
    <div className="flex justify-center items-start w-full relative">
      <div className="w-full max-w-155 min-w-0">
        {/* Top Header: ← Back | Thread (8.4K views) | More (...) */}
        <header className="relative flex items-center justify-between py-2 px-1 mb-2 select-none">
          {/* Nút quay lại */}
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Quay lại"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Tiêu đề & Lượt xem căn giữa */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <h1 className="text-base font-bold text-black dark:text-white leading-tight">
              Thread
            </h1>
            <p className="text-xs text-zinc-500 font-normal">
              {post.views || '8.4K'} views
            </p>
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

        {/* Khung Card chính chứa bài viết gốc và toàn bộ chuỗi replies */}
        <main className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden transition-colors">
          {/* 1. BÀI VIẾT CHÍNH (Main Post) */}
          <article className="p-4 sm:p-5">
            {/* Header tác giả */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar có badge follow dấu cộng [+] */}
                <div className="relative shrink-0">
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-black border border-zinc-700 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                    <Plus className="w-3 h-3 stroke-3" />
                  </div>
                </div>

                {/* Username + Category/Tag + Thời gian */}
                <div className="flex items-center gap-1.5 min-w-0 text-sm">
                  <span className="font-bold text-black dark:text-white hover:underline cursor-pointer truncate">
                    {post.author.username}
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

            {/* Nội dung bài viết */}
            <div className="mt-3 text-[15px] sm:text-base leading-relaxed text-zinc-900 dark:text-zinc-100">
              <p className="whitespace-pre-line inline">
                {post.content}
              </p>
              <button
                onClick={() => showToast('Đã dịch sang Tiếng Việt')}
                className="text-xs text-zinc-500 hover:underline cursor-pointer ml-1.5 inline font-normal"
              >
                Translate
              </button>
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
                    window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'comment' } }));
                    return;
                  }
                  const input = document.getElementById('thread-reply-input');
                  input?.focus();
                }}
                className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer group"
              >
                <MessageCircle className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                <span>{post.comments || 18}</span>
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
                  showToast('Đã sao chép liên kết để chia sẻ');
                }}
                className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer group"
              >
                <Send className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                <span>{post.shares || 14}</span>
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
                id="thread-reply-input"
                type="text"
                placeholder={`Reply to ${post.author.username}...`}
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyDown={handleAddReply}
                onFocus={(e) => {
                  if (!isAuthenticated) {
                    e.target.blur();
                    window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'comment' } }));
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
            {replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onToast={showToast}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        </main>
      </div>

      {/* 1. Nút outline sổ ghi chép [+] ở mép phải giữa màn hình */}
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

      {/* 2. Nút nổi vuông bo góc dấu cộng [+] ở góc dưới bên phải */}
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
        onSubmitPost={(newPostData) => {
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

// Component từng dòng Reply trong chuỗi phản hồi
function ReplyItem({ reply, onToast, isAuthenticated }) {
  const [likes, setLikes] = useState(reply.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [reposts, setReposts] = useState(reply.reposts || 0);
  const [isReposted, setIsReposted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLike = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'like' } }));
      return;
    }
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleRepost = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'repost' } }));
      return;
    }
    if (isReposted) {
      setReposts((prev) => prev - 1);
      setIsReposted(false);
      onToast('Đã hủy đăng lại');
    } else {
      setReposts((prev) => prev + 1);
      setIsReposted(true);
      onToast('Đã đăng lại câu trả lời');
    }
  };

  return (
    <article className="p-4 sm:p-5 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors">
      <div className="flex gap-3">
        {/* Cột Avatar & Đường chỉ dọc (Thread connector line) */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <img
              src={reply.author.avatar}
              alt={reply.author.username}
              className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
            />
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-black border border-zinc-700 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <Plus className="w-3 h-3 stroke-3" />
              </div>
          </div>
          {/* Đường chỉ dọc kết nối chuỗi thảo luận */}
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
                {reply.author.username}
              </span>

              {/* Huy hiệu Author nếu người trả lời chính là chủ thớt */}
              {reply.author.isAuthor && (
                <span className="px-1.5 py-0.5 text-[11px] font-semibold text-blue-500 bg-blue-500/10 rounded-full leading-none">
                  Author
                </span>
              )}

              <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                {reply.timestamp}
              </span>

              {/* Huy hiệu trái tim nhỏ (như của haikts2000yahoocom trong ảnh) */}
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
            <p className="whitespace-pre-line inline">
              {reply.content}
            </p>
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
                  window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'comment' } }));
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
