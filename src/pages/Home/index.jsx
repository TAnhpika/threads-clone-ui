import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { SquarePlus } from 'lucide-react';
import FeedHeader from '@/components/FeedHeader';
import PostCard from '@/components/post/PostCard';
import LoginPanel from '@/components/LoginPanel';
import CreatePostBox from '@/components/post/CreatePostBox';
import CreatePostModal from '@/components/post/CreatePostModal';
import CreateFeedModal from '@/components/feed/CreateFeedModal';
import { mockPosts } from '@/components/post/mockPosts';
import { selectIsAuthenticated, selectCurrentUser } from '@/features/auth/authSlice';

export default function HomePage({ defaultCreateFeedOpen = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const [posts, setPosts] = useState(mockPosts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('center'); // 'center' | 'bottom-right'
  const [isCreateFeedOpen, setIsCreateFeedOpen] = useState(
    defaultCreateFeedOpen || location.pathname === '/custom_feed/create'
  );
  const [toastMessage, setToastMessage] = useState(null);

  // Lắng nghe sự kiện mở Create Post Modal từ sidebar
  useEffect(() => {
    const handleOpenThread = (e) => {
      const placement = e?.detail?.placement || 'center';
      setCreateModalPlacement(placement);
      setIsCreateModalOpen(true);
    };

    window.addEventListener('open-create-thread', handleOpenThread);
    return () => window.removeEventListener('open-create-thread', handleOpenThread);
  }, []);

  // Lắng nghe sự kiện mở Create Feed Modal từ header hoặc menu bài viết
  useEffect(() => {
    const handleOpenFeedModal = () => {
      setIsCreateFeedOpen(true);
      window.history.pushState({}, '', '/custom_feed/create');
    };

    window.addEventListener('open-create-feed', handleOpenFeedModal);
    return () => window.removeEventListener('open-create-feed', handleOpenFeedModal);
  }, []);

  // Kiểm tra nếu route là /custom_feed/create thì tự động mở modal
  useEffect(() => {
    if (location.pathname === '/custom_feed/create') {
      setIsCreateFeedOpen(true);
    }
  }, [location.pathname]);

  const handleOpenCreateFeed = () => {
    setIsCreateFeedOpen(true);
    window.history.pushState({}, '', '/custom_feed/create');
  };

  const handleCloseCreateFeed = () => {
    setIsCreateFeedOpen(false);
    if (window.location.pathname === '/custom_feed/create') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleFeedCreated = (newFeed) => {
    setToastMessage(`Đã tạo bảng tin "${newFeed.name}" thành công ✨`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Xử lý tạo bài viết mới từ modal
  const handleCreatePost = (newPostData) => {
    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        name: currentUser?.name || 'tuananhpika',
        username: currentUser?.username || currentUser?.email?.split('@')[0] || 'tuananhpika',
        avatar:
          currentUser?.avatar ||
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        isVerified: true,
      },
      tag: newPostData.topic || 'Old Money Aesthetic',
      timestamp: 'Vừa xong',
      content: newPostData.content,
      media: newPostData.media || null,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
    };

    setPosts([newPost, ...posts]);
    setToastMessage('Đã đăng bài viết mới thành công ✨');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className={`flex justify-center items-start gap-6 w-full ${isAuthenticated ? 'max-w-2xl mx-auto' : ''}`}>
      {/* Cột giữa: Feed chính chứa FeedHeader, Composer & danh sách PostCard */}
      <section className="flex-1 max-w-160 min-w-0 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden transition-colors">
        {/* Header của Feed: 'For you' khi đã đăng nhập, hoặc 'Trang chủ' khi chưa đăng nhập */}
        <FeedHeader
          title="Trang chủ"
          isLoggedIn={isAuthenticated}
          onCreateFeed={handleOpenCreateFeed}
        />

        {/* Thanh soạn thảo 'What's new?' chỉ xuất hiện khi đã đăng nhập */}
        {isAuthenticated && (
          <CreatePostBox
            user={currentUser}
            onClick={() => {
              setCreateModalPlacement('center');
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {/* Danh sách các bài viết */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Cột phải: LoginPanel mời đăng nhập (chỉ hiển thị khi CHƯA đăng nhập) */}
      {!isAuthenticated && <LoginPanel />}

      {/* Nút nổi tạo bài viết nhanh [+] ở góc dưới bên phải khi đã đăng nhập */}
      {isAuthenticated && (
        <button
          id="floating-new-thread-btn"
          onClick={() => {
            if (isCreateModalOpen && createModalPlacement === 'bottom-right') {
              setIsCreateModalOpen(false);
            } else {
              setCreateModalPlacement('bottom-right');
              setIsCreateModalOpen(true);
            }
          }}
          className="fixed bottom-6 right-6 sm:right-10 w-13 h-13 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 shadow-2xl flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
          title="Tạo Thread mới"
          aria-label="Tạo Thread mới"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[1.9]">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M8 3v18" />
            <path d="M15 9v6" />
            <path d="M12 12h6" />
          </svg>
        </button>
      )}

      {/* Modal tạo bài viết (Hỗ trợ cả 'center' và 'bottom-right' góc phải) */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onSubmitPost={handleCreatePost}
        placement={createModalPlacement}
      />

      {/* Modal tạo bảng tin tùy chỉnh (threads.com/custom_feed/create) */}
      <CreateFeedModal
        isOpen={isCreateFeedOpen}
        onClose={handleCloseCreateFeed}
        onFeedCreated={handleFeedCreated}
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

