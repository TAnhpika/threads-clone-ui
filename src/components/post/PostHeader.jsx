import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import {
  updateAuthorFollowStatus,
  updatePostInteraction,
  removeFeedPost,
  restoreFeedPost,
} from '@/features/feed/feedSlice';
import { followUserApi, unfollowUserApi } from '@/services/userService';
import {
  savePostApi,
  unsavePostApi,
  hidePostApi,
  unhidePostApi,
  reportPostApi,
} from '@/services/postService';
import { MoreHorizontal, CheckCircle2, Plus, Check } from 'lucide-react';
import PostMenu from './PostMenu';
import AuthorProfileModal from './AuthorProfileModal';
import UnfollowConfirmModal from './UnfollowConfirmModal';
import EmbedModal from './EmbedModal';
import { getAuthorAvatar, defaultAvatar } from '@/utils/avatar';
import { getShareUrl } from '@/utils/postUrl';

export default function PostHeader({
  author = {},
  timestamp = '2h',
  tag,
  postId,
  showFollowBadge = true,
  onFollow,
  post,
}) {
  const { name = 'Anonymous', username = 'user', avatar, isVerified = false } = author;
  const shareUrl = getShareUrl({ author }, postId);
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isFollowed, setIsFollowed] = useState(Boolean(author?.isFollowed));
  const [isSaved, setIsSaved] = useState(Boolean(post?.isSaved));
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);

  // Tự động đồng bộ khi Redux feedSlice cập nhật trạng thái follow của tác giả này
  useEffect(() => {
    if (author?.isFollowed !== undefined) {
      setIsFollowed(Boolean(author.isFollowed));
    }
  }, [author?.isFollowed]);

  // Đồng bộ trạng thái lưu bài viết từ prop post
  useEffect(() => {
    if (post?.isSaved !== undefined) {
      setIsSaved(Boolean(post.isSaved));
    }
  }, [post?.isSaved]);

  // Không hiển thị follow badge nếu là bài của chính mình
  const isSelf = Boolean(
    currentUser &&
      (currentUser.username === username || (currentUser.id && currentUser.id === author?.id))
  );

  const shouldRenderFollow = showFollowBadge && !isSelf;

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-auth-prompt', { detail: { type: 'follow' } })
      );
      return;
    }

    // 1. Optimistic Update tại chỗ & đồng bộ toàn feed qua Redux -> chuyển sang tick [✓]
    setIsFollowed(true);
    dispatch(
      updateAuthorFollowStatus({
        userId: author?.id,
        username,
        isFollowed: true,
      })
    );
    setToastMessage(`Đang theo dõi @${username}`);
    setTimeout(() => setToastMessage(null), 2500);

    // 2. Gọi API POST /users/:id/follow
    try {
      if (author?.id) {
        await followUserApi(author.id);
      }
      onFollow?.(author);
    } catch (error) {
      console.error('Follow user API failed:', error);
      // 3. Rollback nếu có lỗi mạng hoặc API thất bại
      setIsFollowed(false);
      dispatch(
        updateAuthorFollowStatus({
          userId: author?.id,
          username,
          isFollowed: false,
        })
      );
      setToastMessage(`Không thể theo dõi @${username}. Vui lòng thử lại.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Click vào dấu tick [✓] (Following) -> mở Profile Modal
  const handleFollowingBadgeClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsProfileModalOpen(true);
  };

  // Click vào nút Following trong Profile Modal -> mở Unfollow Modal (vẫn hiển thị Profile Modal bên dưới)
  const handleOpenUnfollow = () => {
    setIsUnfollowModalOpen(true);
  };

  // Xác nhận Unfollow trong Unfollow Modal
  const handleConfirmUnfollow = async () => {
    setIsUnfollowModalOpen(false);
    setIsProfileModalOpen(false);

    // 1. Optimistic Update tại chỗ & đồng bộ toàn feed qua Redux -> chuyển lại thành [+]
    setIsFollowed(false);
    dispatch(
      updateAuthorFollowStatus({
        userId: author?.id,
        username,
        isFollowed: false,
      })
    );
    setToastMessage(`Đã bỏ theo dõi @${username}`);
    setTimeout(() => setToastMessage(null), 2500);

    // 2. Gọi API huỷ theo dõi (POST /users/:id/follow với body { _method: "DELETE" })
    try {
      if (author?.id) {
        await unfollowUserApi(author.id);
      }
    } catch (error) {
      console.error('Unfollow user API failed:', error);
      // 3. Rollback nếu lỗi
      setIsFollowed(true);
      dispatch(
        updateAuthorFollowStatus({
          userId: author?.id,
          username,
          isFollowed: true,
        })
      );
      setToastMessage(`Không thể huỷ theo dõi @${username}. Vui lòng thử lại.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const currentFeedPosts = useSelector((state) => state.feed?.forYou?.posts);

  const handleAction = async (action) => {
    const currentPostId = postId || post?.id;

    if (action === 'copy_link') {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Đã sao chép liên kết vào bộ nhớ tạm' },
        })
      );
    } else if (action === 'embed') {
      setIsEmbedModalOpen(true);
    } else if (action === 'create_feed') {
      window.dispatchEvent(new CustomEvent('open-create-feed'));
    } else if (action === 'save') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'save' } }));
        return;
      }
      setIsSaved(true);
      if (currentPostId) {
        dispatch(updatePostInteraction({ postId: currentPostId, updates: { isSaved: true } }));
      }
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Đã lưu bài viết' },
        })
      );

      try {
        if (currentPostId) {
          await savePostApi(currentPostId);
        }
      } catch (err) {
        console.error('Save post failed:', err);
        setIsSaved(false);
        if (currentPostId) {
          dispatch(updatePostInteraction({ postId: currentPostId, updates: { isSaved: false } }));
        }
        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: { message: 'Không thể lưu bài viết. Vui lòng thử lại.' },
          })
        );
      }
    } else if (action === 'unsave') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'save' } }));
        return;
      }
      setIsSaved(false);
      if (currentPostId) {
        dispatch(updatePostInteraction({ postId: currentPostId, updates: { isSaved: false } }));
      }
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Đã bỏ lưu bài viết' },
        })
      );

      try {
        if (currentPostId) {
          await unsavePostApi(currentPostId);
        }
      } catch (err) {
        console.error('Unsave post failed:', err);
        setIsSaved(true);
        if (currentPostId) {
          dispatch(updatePostInteraction({ postId: currentPostId, updates: { isSaved: true } }));
        }
        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: { message: 'Không thể bỏ lưu bài viết. Vui lòng thử lại.' },
          })
        );
      }
    } else if (action === 'not_interested') {
      const postBackup = post || { id: currentPostId, author, timestamp, tag };
      const postIndex = currentFeedPosts?.findIndex((p) => String(p.id) === String(currentPostId));

      if (currentPostId) {
        dispatch(removeFeedPost(currentPostId));
      }

      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: {
            message: 'Đã ẩn bài viết',
            undoText: 'Hoàn tác',
            duration: 6000,
            onUndo: async () => {
              if (currentPostId) {
                dispatch(restoreFeedPost({ post: postBackup, index: postIndex }));
                window.dispatchEvent(
                  new CustomEvent('app-toast', {
                    detail: {
                      message: 'Đã hoàn tác ẩn bài viết',
                      duration: 2500,
                    },
                  })
                );
                try {
                  await unhidePostApi(currentPostId);
                } catch (err) {
                  console.error('Unhide post failed:', err);
                }
              }
            },
          },
        })
      );

      try {
        if (currentPostId) {
          await hidePostApi(currentPostId);
        }
      } catch (err) {
        console.error('Hide post failed:', err);
        if (currentPostId) {
          dispatch(restoreFeedPost({ post: postBackup, index: postIndex }));
        }
        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: { message: 'Không thể ẩn bài viết. Vui lòng thử lại.' },
          })
        );
      }
    } else if (action === 'report') {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét bài viết này.' },
        })
      );
      try {
        if (currentPostId) {
          await reportPostApi(currentPostId);
        }
      } catch (err) {
        console.error('Report post failed:', err);
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 relative">
      {/* Thông tin tác giả & thời gian */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={avatar || getAuthorAvatar(author)}
            alt={name}
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
            className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
            loading="lazy"
          />
          {shouldRenderFollow && (
            isFollowed ? (
              // Badge [✓] khi ĐÃ THEO DÕI -> click mở Profile Modal
              <button
                type="button"
                onClick={handleFollowingBadgeClick}
                title="Following"
                aria-label={`Following @${username}`}
                className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-white dark:bg-white text-black dark:text-black border-2 border-white dark:border-[#121212] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-xs z-10"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
            ) : (
              // Badge [+] khi CHƯA THEO DÕI -> click thực hiện Follow
              <button
                type="button"
                onClick={handleFollowClick}
                title="Follow"
                aria-label={`Follow @${username}`}
                className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-[#121212] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-xs z-10"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            )
          )}
        </div>

        {/* Tên, Verified & Thời gian */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="font-bold text-sm text-black dark:text-white hover:underline cursor-pointer truncate">
            {username}
          </span>

          {isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
          )}

          {tag && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0">
              <span>›</span>
              <span className="font-medium hover:underline cursor-pointer">{tag}</span>
            </span>
          )}

          <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
            · {timestamp}
          </span>
        </div>
      </div>

      {/* Nút tùy chọn More (...) & Menu Modal */}
      <div className="relative shrink-0">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            isMenuOpen
              ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
              : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title="Tùy chọn"
          aria-label="Tùy chọn bài viết"
          aria-expanded={isMenuOpen}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Post Menu Modal / Dropdown */}
        <PostMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onAction={handleAction}
          postUrl={shareUrl}
          isSaved={isSaved}
        />
      </div>

      {/* Modal Profile tác giả khi click vào tick [✓] */}
      <AuthorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        author={author}
        onOpenUnfollow={handleOpenUnfollow}
      />

      {/* Modal xác nhận Unfollow khi click nút Following trong Profile Modal */}
      <UnfollowConfirmModal
        isOpen={isUnfollowModalOpen}
        onClose={() => setIsUnfollowModalOpen(false)}
        author={author}
        onConfirmUnfollow={handleConfirmUnfollow}
      />

      {/* Modal Get Embed Code */}
      <EmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        post={post || { id: postId, author, timestamp, tag }}
        postId={postId}
        onSuccessFeedback={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 2500);
        }}
      />

      {/* Toast thông báo tương tác nhanh */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-3">
          <span>{typeof toastMessage === 'string' ? toastMessage : toastMessage.text}</span>
          {typeof toastMessage === 'object' && toastMessage?.onUndo && (
            <button
              type="button"
              onClick={() => {
                toastMessage.onUndo();
                setToastMessage(null);
              }}
              className="underline hover:opacity-80 font-bold cursor-pointer text-blue-400 dark:text-blue-600"
            >
              Hoàn tác
            </button>
          )}
        </div>
      )}
    </div>
  );
}

