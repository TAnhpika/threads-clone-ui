import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import FeedHeader from '@/components/FeedHeader';
import PostCard from '@/components/post/PostCard';
import LoginPanel from '@/components/LoginPanel';
import CreatePostBox from '@/components/post/CreatePostBox';
import CreatePostModal from '@/components/post/CreatePostModal';
import CreateFeedModal from '@/components/feed/CreateFeedModal';
import SuggestedProfiles from '@/components/feed/SuggestedProfiles';
import { mockPosts } from '@/components/post/mockPosts';
import { useInfinityLoad } from '@/hooks/useInfinityLoad';
import { selectIsAuthenticated, selectCurrentUser } from '@/features/auth/authSlice';
import userAvatar from '@/assets/images/ava.png';

const INITIAL_BATCH_SIZE = 6;
const PAGE_SIZE = 3;

export default function HomePage({ defaultCreateFeedOpen = false }) {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  // Khởi tạo batch bài viết ban đầu không bị trùng
  const [posts, setPosts] = useState(() => mockPosts.slice(0, INITIAL_BATCH_SIZE));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => mockPosts.length > INITIAL_BATCH_SIZE);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('center'); // 'center' | 'bottom-right'
  const [isCreateFeedOpen, setIsCreateFeedOpen] = useState(
    defaultCreateFeedOpen || location.pathname === '/custom_feed/create'
  );
  const [toastMessage, setToastMessage] = useState(null);
  const [showSuggested, setShowSuggested] = useState(false);

  // Tải thêm bài viết: lọc triệt để các bài viết đã có để đảm bảo bài mới KHÔNG BAO GIỜ bị trùng
  const loadMorePosts = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    // Lọc các bài viết trong mockPosts chưa từng xuất hiện trên trang
    const loadedIds = new Set(posts.map((p) => p.id));
    const unrenderedPosts = mockPosts.filter((p) => !loadedIds.has(p.id));

    // Nếu đã tải hết tất cả bài viết mẫu
    if (unrenderedPosts.length === 0) {
      setHasMore(false);
      return;
    }

    setIsLoadingMore(true);

    setTimeout(() => {
      const nextBatch = unrenderedPosts.slice(0, PAGE_SIZE);
      setPosts((prev) => [...prev, ...nextBatch]);
      setIsLoadingMore(false);

      if (unrenderedPosts.length <= PAGE_SIZE) {
        setHasMore(false);
      }
    }, 400);
  }, [isLoadingMore, hasMore, posts]);

  // Sử dụng hook useInfinityLoad để lắng nghe khi cuộn chạm đáy
  const { sentinelRef } = useInfinityLoad({
    onIntersect: loadMorePosts,
    hasMore,
    isLoading: isLoadingMore,
    rootMargin: '300px 0px',
  });

  // Khi lướt xuống khoảng 150% viewheight (scrollY >= 1.5 * viewHeight) thì hiển thị Suggested for you
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const viewHeight = window.innerHeight || 800;

      if (scrollY >= viewHeight * 1.5) {
        setShowSuggested(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        avatar: currentUser?.avatar || userAvatar,
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

  // Khi CHƯA ĐĂNG NHẬP: Layout chuẩn mẫu Threads - Header 'Home' trên cột Posts, Block Log in ngang height với Posts
  if (!isAuthenticated) {
    return (
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,620px)_350px] gap-x-8 gap-y-3 w-full max-w-260 justify-center items-start">
          {/* Row 1, Col 1: Tiêu đề 'Home' */}
          <div className="col-span-1 px-1">
            <h1 className="text-xl font-bold text-black dark:text-white tracking-tight">
              Home
            </h1>
          </div>

          {/* Row 1, Col 2: Khoảng trống tương ứng của tiêu đề */}
          <div className="hidden lg:block" />

          {/* Row 2, Col 1: Khối Posts Feed */}
          <div className="w-full min-w-0">
            <section className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden transition-colors">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {posts.flatMap((post, index) => {
                  const isTarget =
                    post.id === 'post-fidsulaiman9' ||
                    (!posts.some((p) => p.id === 'post-fidsulaiman9') && index === 1);
                  const items = [<PostCard key={post.id} post={post} />];
                  if (showSuggested && isTarget) {
                    items.push(<SuggestedProfiles key="suggested-profiles-unauth" />);
                  }
                  return items;
                })}
              </div>

              {/* Sentinel và loading indicator cho infinite scroll */}
              <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center min-h-14 border-t border-zinc-100 dark:border-zinc-800/80">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    <span className="text-xs font-semibold">Đang tải thêm bài viết...</span>
                  </div>
                ) : !hasMore ? (
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium py-1">
                    Đã hiển thị tất cả bài viết
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 opacity-60" />
                )}
              </div>
            </section>
          </div>

          {/* Row 2, Col 2: Block Log in nằm ngang height với Posts */}
          <LoginPanel />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-start gap-8 w-full ${isAuthenticated ? 'max-w-2xl mx-auto' : ''}`}>
      {/* Cột giữa: Feed Header nằm ngoài, và Card chứa What's new & Posts */}
      <div className="flex-1 max-w-155 min-w-0">
        {/* Header của Feed: 'For you' nằm riêng phía trên Card */}
        <FeedHeader
          title="Trang chủ"
          isLoggedIn={isAuthenticated}
          onCreateFeed={handleOpenCreateFeed}
        />

        {/* Khối Card chính bo góc chứa Composer & Danh sách Post */}
        <section className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden transition-colors">
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

          {/* Dải phân cách '☆ First thread' */}
          <div className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>First thread</span>
          </div>

          {/* Danh sách các bài viết */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {posts.flatMap((post, index) => {
              const isTarget =
                post.id === 'post-fidsulaiman9' ||
                (!posts.some((p) => p.id === 'post-fidsulaiman9') && index === 1);
              const items = [<PostCard key={post.id} post={post} />];
              if (showSuggested && isTarget) {
                items.push(<SuggestedProfiles key="suggested-profiles-auth" />);
              }
              return items;
            })}
          </div>

          {/* Sentinel và loading indicator cho infinite scroll */}
          <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center min-h-14 border-t border-zinc-100 dark:border-zinc-800/80">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                <span className="text-xs font-semibold">Đang tải thêm bài viết...</span>
              </div>
            ) : !hasMore ? (
              <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium py-1">
                Đã hiển thị tất cả bài viết
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 opacity-60" />
            )}
          </div>
        </section>
      </div>

      {/* Cột phải: LoginPanel mời đăng nhập (chỉ hiển thị khi CHƯA đăng nhập) */}
      {!isAuthenticated && <LoginPanel />}

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
            if (isCreateModalOpen && createModalPlacement === 'bottom-right') {
              setIsCreateModalOpen(false);
            } else {
              setCreateModalPlacement('bottom-right');
              setIsCreateModalOpen(true);
            }
          }}
          className="fixed bottom-6 right-6 sm:right-8 w-14 h-14 rounded-2xl bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
          title="Tạo Thread mới"
          aria-label="Tạo Thread mới"
        >
          <Plus className="w-7 h-7 stroke-[2.2]" />
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

