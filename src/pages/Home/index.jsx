import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import FeedHeader from '@/components/FeedHeader';
import PostCard from '@/components/post/PostCard';
import LoginPanel from '@/components/LoginPanel';
import CreatePostBox from '@/components/post/CreatePostBox';
import CreatePostModal from '@/components/post/CreatePostModal';
import CreateFeedModal from '@/components/feed/CreateFeedModal';
import SuggestedProfiles from '@/components/feed/SuggestedProfiles';
import { getFeed } from '@/services/postService';
import { useInfinityLoad } from '@/hooks/useInfinityLoad';
import { selectIsAuthenticated, selectCurrentUser } from '@/features/auth/authSlice';
import {
  selectFeedState,
  setFeedData,
  appendFeedData,
  saveFeedScroll,
  prependFeedPost,
} from '@/features/feed/feedSlice';
import userAvatar from '@/assets/images/ava.png';

// Skeleton hiển thị khi đang tải danh sách bài viết
function PostSkeleton() {
  return (
    <div className="py-4 px-4 sm:px-5 border-b border-zinc-100 dark:border-zinc-800/80 animate-pulse select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="w-28 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="w-16 h-3 bg-zinc-100 dark:bg-zinc-850 rounded" />
        </div>
      </div>
      <div className="pl-13 mt-3 space-y-2">
        <div className="w-11/12 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="w-4/5 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="w-2/3 h-3.5 bg-zinc-100 dark:bg-zinc-850 rounded" />
      </div>
    </div>
  );
}

// Số lượng bài viết tải mỗi trang (khớp chuẩn 4 bài viết ban đầu của threads.com)
const FEED_PER_PAGE = 4;

export default function HomePage({ defaultCreateFeedOpen = false, defaultFeedType }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  // Xác định active feedType ('for_you' | 'following')
  const feedType = location.pathname === '/following' ? 'following' : (defaultFeedType || 'for_you');

  // Lấy dữ liệu feed từ Redux store
  const feedState = useSelector(selectFeedState(feedType));
  const posts = feedState.posts;
  const page = feedState.page;
  const hasMore = feedState.hasMore;
  const isLoaded = feedState.isLoaded;

  const [isLoadingInitial, setIsLoadingInitial] = useState(!isLoaded);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('center'); // 'center' | 'bottom-right'
  const [isCreateFeedOpen, setIsCreateFeedOpen] = useState(
    defaultCreateFeedOpen || location.pathname === '/custom_feed/create'
  );
  const [toastMessage, setToastMessage] = useState(null);

  // Tránh fetch trùng lặp trong React StrictMode
  const isFetchingRef = useRef(false);
  const hasRestoredScrollRef = useRef(false);

  // Hàm gọi API lấy danh sách bài viết từ backend và lưu vào Redux
  const fetchFeed = useCallback(
    async (targetPage = 1, targetType = 'for_you', isReset = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isReset) {
        setIsLoadingInitial(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const res = await getFeed({
          type: targetType,
          page: targetPage,
          per_page: FEED_PER_PAGE,
        });

        const newPosts = res.data || [];
        const pagination = res.pagination;
        const nextHasMore = pagination
          ? pagination.current_page < pagination.last_page
          : newPosts.length >= FEED_PER_PAGE;

        if (isReset) {
          dispatch(
            setFeedData({
              feedType: targetType,
              posts: newPosts,
              page: 1,
              hasMore: nextHasMore,
            })
          );
        } else {
          dispatch(
            appendFeedData({
              feedType: targetType,
              posts: newPosts,
              page: targetPage,
              hasMore: nextHasMore,
            })
          );
        }
      } catch (err) {
        console.error('Fetch feed error:', err);
        setError('Không thể tải bảng tin. Vui lòng thử lại sau.');
      } finally {
        setIsLoadingInitial(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [dispatch]
  );

  // Lần đầu mount hoặc khi đổi tab: Chỉ gọi API nếu tab đó chưa từng load dữ liệu
  useEffect(() => {
    hasRestoredScrollRef.current = false;
    if (!feedState.isLoaded || feedState.posts.length === 0) {
      fetchFeed(1, feedType, true);
    } else {
      setIsLoadingInitial(false);
    }
  }, [feedType, feedState.isLoaded, feedState.posts.length, fetchFeed]);

  // Khôi phục vị trí cuộn trang khi user quay lại từ PostDetail
  useEffect(() => {
    if (!hasRestoredScrollRef.current && feedState.isLoaded && feedState.posts.length > 0) {
      const { scrollPosition, lastClickedPostId } = feedState;
      if (scrollPosition > 0 || lastClickedPostId) {
        hasRestoredScrollRef.current = true;
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollPosition,
            behavior: 'instant',
          });

          // Fallback định vị trúng card nếu chiều cao có chênh lệch nhẹ
          if (lastClickedPostId) {
            const targetEl = document.getElementById(`post-card-${lastClickedPostId}`);
            if (targetEl) {
              targetEl.scrollIntoView({ block: 'nearest', behavior: 'instant' });
            }
          }
        });
      }
    }
  }, [feedState.isLoaded, feedState.posts.length, feedState.scrollPosition, feedState.lastClickedPostId]);

  // Luôn lưu tọa độ scroll hiện tại khi người dùng cuộn hoặc rời khỏi trang
  useEffect(() => {
    const handleScrollSave = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 0) {
        dispatch(saveFeedScroll({ feedType, scrollPosition: y }));
      }
    };

    window.addEventListener('scroll', handleScrollSave, { passive: true });
    return () => {
      handleScrollSave();
      window.removeEventListener('scroll', handleScrollSave);
    };
  }, [feedType, dispatch]);

  // Tải thêm bài viết khi cuộn chạm đáy (Infinite scroll)
  // Khi ở các trang đầu (page <= 4), tự động kích hoạt tải thêm 3 lần liên tiếp để tạo buffer chống gián đoạn khi lướt nhanh
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || isLoadingInitial || !hasMore || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    const targetType = feedType;
    const startPage = page + 1;
    const consecutiveBatches = page <= 4 ? 3 : 1;

    try {
      let currentPage = startPage;
      for (let i = 0; i < consecutiveBatches; i++) {
        const res = await getFeed({
          type: targetType,
          page: currentPage,
          per_page: FEED_PER_PAGE,
        });

        const newPosts = res.data || [];
        const pagination = res.pagination;
        const nextHasMore = pagination
          ? pagination.current_page < pagination.last_page
          : newPosts.length >= FEED_PER_PAGE;

        dispatch(
          appendFeedData({
            feedType: targetType,
            posts: newPosts,
            page: currentPage,
            hasMore: nextHasMore,
          })
        );

        if (!nextHasMore || newPosts.length === 0) break;
        currentPage += 1;
      }
    } catch (err) {
      console.error('Fetch consecutive feed error:', err);
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [isLoadingMore, isLoadingInitial, hasMore, page, feedType, dispatch]);

  // Hook lắng nghe chạm đáy với rootMargin 1000px kích hoạt từ rất sớm trước khi user chạm tới đáy
  const { sentinelRef } = useInfinityLoad({
    onIntersect: loadMorePosts,
    hasMore,
    isLoading: isLoadingMore || isLoadingInitial,
    rootMargin: '1000px 0px',
  });

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
        id: currentUser?.id,
        name: currentUser?.name || 'User',
        username: currentUser?.username || currentUser?.email?.split('@')[0] || 'user',
        avatar: currentUser?.avatar || userAvatar,
        isVerified: true,
      },
      tag: newPostData.topic || null,
      timestamp: 'vừa xong',
      content: newPostData.content,
      media: newPostData.media ? { url: newPostData.media.url, urls: [newPostData.media.url] } : null,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
      isReposted: false,
    };

    dispatch(prependFeedPost({ feedType, post: newPost }));
    setToastMessage('Đã đăng bài viết mới thành công ✨');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Khối danh sách bài viết dùng chung cho cả 2 view (Authenticated & Unauthenticated)
  const renderPostList = () => {
    if (isLoadingInitial && posts.length === 0) {
      return (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      );
    }

    if (error && posts.length === 0) {
      return (
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-zinc-500 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fetchFeed(1, feedType, true)}
            className="px-5 py-2.5 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Chưa có bài viết nào
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm">
            {feedType === 'following'
              ? 'Hãy theo dõi thêm người dùng để xem bài viết của họ tại đây.'
              : 'Hãy là người đầu tiên chia sẻ bài viết mới trên Threads!'}
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {posts.flatMap((post, index) => {
          const items = [<PostCard key={post.id} post={post} feedType={feedType} />];
          // Đặt cố định sau bài viết thứ 4 (cuối đợt tải 1) giúp cuộn 100% mượt mà, không giật
          const isTarget = index === 3 || (posts.length < 4 && index === posts.length - 1);
          if (isTarget) {
            items.push(
              <SuggestedProfiles
                key={isAuthenticated ? 'suggested-profiles-auth' : 'suggested-profiles-unauth'}
              />
            );
          }
          return items;
        })}
      </div>
    );
  };

  // Khi CHƯA ĐĂNG NHẬP: Layout chuẩn mẫu Threads - Header 'Home' trên cột Posts, Block Log in ngang height với Posts
  if (!isAuthenticated) {
    return (
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,620px)_350px] gap-x-8 gap-y-3 w-full max-w-260 justify-center items-start">
          {/* Row 1, Col 1: Tiêu đề 'Home' hoặc 'Following' */}
          <div className="col-span-1 px-1">
            <h1 className="text-xl font-bold text-black dark:text-white tracking-tight">
              {feedType === 'following' ? 'Following' : 'Home'}
            </h1>
          </div>

          {/* Row 1, Col 2: Khoảng trống tương ứng của tiêu đề */}
          <div className="hidden lg:block" />

          {/* Row 2, Col 1: Khối Posts Feed */}
          <div className="w-full min-w-0">
            <section className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden transition-colors">
              {renderPostList()}

              {/* Sentinel và loading indicator cho infinite scroll */}
              <div
                ref={sentinelRef}
                className="py-6 flex flex-col items-center justify-center min-h-14 border-t border-zinc-100 dark:border-zinc-800/80"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    <span className="text-xs font-semibold">Đang tải thêm bài viết...</span>
                  </div>
                ) : !hasMore && posts.length > 0 ? (
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

  // Khi ĐÃ ĐĂNG NHẬP
  return (
    <div className="flex justify-center items-start gap-8 w-full max-w-2xl mx-auto">
      {/* Cột giữa: Feed Header nằm ngoài, và Card chứa What's new & Posts */}
      <div className="flex-1 max-w-155 min-w-0">
        {/* Header của Feed: 'For you' hoặc 'Following' chuẩn Threads.com */}
        <FeedHeader
          title={feedType === 'following' ? 'Following' : 'For you'}
          isLoggedIn={isAuthenticated}
          onCreateFeed={handleOpenCreateFeed}
        />

        {/* Khối Card chính bo góc chứa Composer & Danh sách Post */}
        <section className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden transition-colors">
          {/* Thanh soạn thảo 'What's new?' */}
          <CreatePostBox
            user={currentUser}
            onClick={() => {
              setCreateModalPlacement('center');
              setIsCreateModalOpen(true);
            }}
          />

          {/* Dải phân cách '☆ First thread' */}
          <div className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>First thread</span>
          </div>

          {/* Danh sách các bài viết */}
          {renderPostList()}

          {/* Sentinel và loading indicator cho infinite scroll */}
          <div
            ref={sentinelRef}
            className="py-6 flex flex-col items-center justify-center min-h-14 border-t border-zinc-100 dark:border-zinc-800/80"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                <span className="text-xs font-semibold">Đang tải thêm bài viết...</span>
              </div>
            ) : !hasMore && posts.length > 0 ? (
              <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium py-1">
                Đã hiển thị tất cả bài viết
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 opacity-60" />
            )}
          </div>
        </section>
      </div>

      {/* 1. Nút outline sổ ghi chép [+] ở mép phải giữa màn hình */}
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

      {/* 2. Nút nổi vuông bo góc dấu cộng [+] ở góc dưới bên phải */}
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
