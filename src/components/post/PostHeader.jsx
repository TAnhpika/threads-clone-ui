import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import {
  updateAuthorFollowStatus,
  updateAuthorMuteStatus,
  updateAuthorRestrictStatus,
  updateAuthorBlockStatus,
  updatePostHideStatus,
  hidePostsByAuthor,
  restorePostsByAuthor,
  updatePostInteraction,
  removeFeedPost,
  restoreFeedPost,
} from '@/features/feed/feedSlice';
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
import {
  savePostApi,
  unsavePostApi,
  hidePostApi,
  unhidePostApi,
  reportPostApi,
  deletePostApi,
} from '@/services/postService';
import { MoreHorizontal, CheckCircle2, Plus, Check } from 'lucide-react';
import PostMenu from './PostMenu';
import AuthorProfileModal from './AuthorProfileModal';
import UnfollowConfirmModal from './UnfollowConfirmModal';
import BlockConfirmModal from './BlockConfirmModal';
import DeletePostConfirmModal from './DeletePostConfirmModal';
import EditPostModal from './EditPostModal';
import EmbedModal from './EmbedModal';
import ReportModal from './ReportModal';
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
  const currentFeedPosts = useSelector((state) => {
    const activeFeedType = state.feed?.activeFeedType || 'for_you';
    const key = activeFeedType === 'following' ? 'following' : 'forYou';
    return state.feed?.[key]?.posts || [];
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isFollowed, setIsFollowed] = useState(Boolean(author?.isFollowed));
  const [isSaved, setIsSaved] = useState(Boolean(post?.isSaved));
  const [isMuted, setIsMuted] = useState(Boolean(author?.isMuted));
  const [isRestricted, setIsRestricted] = useState(Boolean(author?.isRestricted));
  const [isBlocked, setIsBlocked] = useState(Boolean(author?.isBlocked));
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(Boolean(post?.isPinned));
  const [isArchived, setIsArchived] = useState(Boolean(post?.isArchived));
  const [isHideLikes, setIsHideLikes] = useState(Boolean(post?.isHideLikes));

  // Tự động đồng bộ khi prop author.isMuted thay đổi
  useEffect(() => {
    if (author?.isMuted !== undefined) {
      setIsMuted(Boolean(author.isMuted));
    }
  }, [author?.isMuted]);

  // Tự động đồng bộ khi prop author.isRestricted thay đổi
  useEffect(() => {
    if (author?.isRestricted !== undefined) {
      setIsRestricted(Boolean(author.isRestricted));
    }
  }, [author?.isRestricted]);

  // Tự động đồng bộ khi prop author.isBlocked thay đổi
  useEffect(() => {
    if (author?.isBlocked !== undefined) {
      setIsBlocked(Boolean(author.isBlocked));
    }
  }, [author?.isBlocked]);

  // Lắng nghe sự kiện author-mute-changed trên toàn ứng dụng
  useEffect(() => {
    const handleMuteChange = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const targetUsername = username;
      const matchId = detail.userId && targetUserId && String(detail.userId) === String(targetUserId);
      const matchUser = detail.username && targetUsername && detail.username === targetUsername;
      if (matchId || matchUser) {
        setIsMuted(Boolean(detail.isMuted));
      }
    };
    window.addEventListener('author-mute-changed', handleMuteChange);
    return () => window.removeEventListener('author-mute-changed', handleMuteChange);
  }, [author?.id, post?.author?.id, post?.raw?.user?.id, username]);

  // Lắng nghe sự kiện author-restrict-changed trên toàn ứng dụng
  useEffect(() => {
    const handleRestrictChange = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const targetUsername = username;
      const matchId = detail.userId && targetUserId && String(detail.userId) === String(targetUserId);
      const matchUser = detail.username && targetUsername && detail.username === targetUsername;
      if (matchId || matchUser) {
        setIsRestricted(Boolean(detail.isRestricted));
      }
    };
    window.addEventListener('author-restrict-changed', handleRestrictChange);
    return () => window.removeEventListener('author-restrict-changed', handleRestrictChange);
  }, [author?.id, post?.author?.id, post?.raw?.user?.id, username]);

  // Lắng nghe sự kiện author-block-changed trên toàn ứng dụng
  useEffect(() => {
    const handleBlockChange = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const targetUsername = username;
      const matchId = detail.userId && targetUserId && String(detail.userId) === String(targetUserId);
      const matchUser = detail.username && targetUsername && detail.username === targetUsername;
      if (matchId || matchUser) {
        setIsBlocked(Boolean(detail.isBlocked));
      }
    };
    window.addEventListener('author-block-changed', handleBlockChange);
    return () => window.removeEventListener('author-block-changed', handleBlockChange);
  }, [author?.id, post?.author?.id, post?.raw?.user?.id, username]);

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

  // Kiểm tra bài viết có phải của chính người dùng hiện tại không
  const isSelf = Boolean(
    currentUser &&
      (currentUser.username === username || (currentUser.id && currentUser.id === author?.id))
  );

  const isOwnPost = Boolean(
    isSelf ||
    (currentUser && (
      (author?.id && String(author.id) === String(currentUser.id)) ||
      (author?.username && author.username === currentUser.username) ||
      (post?.author?.id && String(post.author.id) === String(currentUser.id)) ||
      (post?.author?.username && post.author.username === currentUser.username)
    ))
  );

  const shouldRenderFollow = showFollowBadge && !isOwnPost;

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

  // Xác nhận chặn người dùng trong BlockConfirmModal
  const handleConfirmBlock = async () => {
    setIsBlockModalOpen(false);

    const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
    const targetUsername = username || 'user';

    setIsBlocked(true);
    if (targetUserId || targetUsername) {
      dispatch(updateAuthorBlockStatus({ userId: targetUserId, username: targetUsername, isBlocked: true }));
      window.dispatchEvent(
        new CustomEvent('author-block-changed', {
          detail: { userId: targetUserId, username: targetUsername, isBlocked: true },
        })
      );
    }

    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { message: 'Blocked', duration: 3000 },
      })
    );

    try {
      if (targetUserId) {
        await blockUserApi(targetUserId);
      }
    } catch (err) {
      console.error('Block user failed:', err);
      setIsBlocked(false);
      if (targetUserId || targetUsername) {
        dispatch(updateAuthorBlockStatus({ userId: targetUserId, username: targetUsername, isBlocked: false }));
        window.dispatchEvent(
          new CustomEvent('author-block-changed', {
            detail: { userId: targetUserId, username: targetUsername, isBlocked: false },
          })
        );
      }
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Không thể chặn người dùng. Vui lòng thử lại.' },
        })
      );
    }
  };

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
      if (currentPostId) {
        dispatch(updatePostHideStatus({ postId: currentPostId, isHidden: true }));
        window.dispatchEvent(
          new CustomEvent('post-hide-changed', {
            detail: { postId: currentPostId, isHidden: true },
          })
        );
      }

      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: {
            message: 'Hidden',
            duration: 3000,
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
          dispatch(updatePostHideStatus({ postId: currentPostId, isHidden: false }));
          window.dispatchEvent(
            new CustomEvent('post-hide-changed', {
              detail: { postId: currentPostId, isHidden: false },
            })
          );
        }
        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: { message: 'Không thể ẩn bài viết. Vui lòng thử lại.' },
          })
        );
      }
    } else if (action === 'mute') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'mute' } }));
        return;
      }
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const targetUsername = username || 'user';

      setIsMuted(true);
      if (targetUserId || targetUsername) {
        dispatch(updateAuthorMuteStatus({ userId: targetUserId, username: targetUsername, isMuted: true }));
        window.dispatchEvent(
          new CustomEvent('author-mute-changed', {
            detail: { userId: targetUserId, username: targetUsername, isMuted: true },
          })
        );
      }

      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Muted', duration: 3000 },
        })
      );

      try {
        if (targetUserId) {
          await muteUserApi(targetUserId);
        }
      } catch (err) {
        console.error('Mute user failed:', err);
        setIsMuted(false);
        if (targetUserId || targetUsername) {
          dispatch(updateAuthorMuteStatus({ userId: targetUserId, username: targetUsername, isMuted: false }));
          window.dispatchEvent(
            new CustomEvent('author-mute-changed', {
              detail: { userId: targetUserId, username: targetUsername, isMuted: false },
            })
          );
        }
      }
    } else if (action === 'unmute') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'mute' } }));
        return;
      }
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const targetUsername = username || 'user';

      setIsMuted(false);
      if (targetUserId || targetUsername) {
        dispatch(updateAuthorMuteStatus({ userId: targetUserId, username: targetUsername, isMuted: false }));
        window.dispatchEvent(
          new CustomEvent('author-mute-changed', {
            detail: { userId: targetUserId, username: targetUsername, isMuted: false },
          })
        );
      }

      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Unmuted', duration: 2500 },
        })
      );

      try {
        if (targetUserId) {
          await unmuteUserApi(targetUserId);
        }
      } catch (err) {
        console.error('Unmute user failed:', err);
        setIsMuted(true);
        if (targetUserId || targetUsername) {
          dispatch(updateAuthorMuteStatus({ userId: targetUserId, username: targetUsername, isMuted: true }));
          window.dispatchEvent(
            new CustomEvent('author-mute-changed', {
              detail: { userId: targetUserId, username: targetUsername, isMuted: true },
            })
          );
        }
      }
    } else if (action === 'restrict') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'restrict' } }));
        return;
      }
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const targetUsername = username || 'user';

      setIsRestricted(true);
      if (targetUserId || targetUsername) {
        dispatch(updateAuthorRestrictStatus({ userId: targetUserId, username: targetUsername, isRestricted: true }));
        window.dispatchEvent(
          new CustomEvent('author-restrict-changed', {
            detail: { userId: targetUserId, username: targetUsername, isRestricted: true },
          })
        );
      }

      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Restricted', duration: 3000 },
        })
      );

      try {
        if (targetUserId) {
          await restrictUserApi(targetUserId);
        }
      } catch (err) {
        console.error('Restrict user failed:', err);
        setIsRestricted(false);
        if (targetUserId || targetUsername) {
          dispatch(updateAuthorRestrictStatus({ userId: targetUserId, username: targetUsername, isRestricted: false }));
          window.dispatchEvent(
            new CustomEvent('author-restrict-changed', {
              detail: { userId: targetUserId, username: targetUsername, isRestricted: false },
            })
          );
        }
      }
    } else if (action === 'unrestrict') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'restrict' } }));
        return;
      }
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const targetUsername = username || 'user';

      setIsRestricted(false);
      if (targetUserId || targetUsername) {
        dispatch(updateAuthorRestrictStatus({ userId: targetUserId, username: targetUsername, isRestricted: false }));
        window.dispatchEvent(
          new CustomEvent('author-restrict-changed', {
            detail: { userId: targetUserId, username: targetUsername, isRestricted: false },
          })
        );
      }

      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Unrestricted', duration: 2500 },
        })
      );

      try {
        if (targetUserId) {
          await unrestrictUserApi(targetUserId);
        }
      } catch (err) {
        console.error('Unrestrict user failed:', err);
        setIsRestricted(true);
        if (targetUserId || targetUsername) {
          dispatch(updateAuthorRestrictStatus({ userId: targetUserId, username: targetUsername, isRestricted: true }));
          window.dispatchEvent(
            new CustomEvent('author-restrict-changed', {
              detail: { userId: targetUserId, username: targetUsername, isRestricted: true },
            })
          );
        }
      }
    } else if (action === 'block') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'block' } }));
        return;
      }
      setIsBlockModalOpen(true);
    } else if (action === 'unblock') {
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type: 'block' } }));
        return;
      }
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const targetUsername = username || 'user';

      setIsBlocked(false);
      if (targetUserId || targetUsername) {
        dispatch(updateAuthorBlockStatus({ userId: targetUserId, username: targetUsername, isBlocked: false }));
        window.dispatchEvent(
          new CustomEvent('author-block-changed', {
            detail: { userId: targetUserId, username: targetUsername, isBlocked: false },
          })
        );
      }

      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Unblocked', duration: 2500 },
        })
      );

      try {
        if (targetUserId) {
          await unblockUserApi(targetUserId);
        }
      } catch (err) {
        console.error('Unblock user failed:', err);
        setIsBlocked(true);
        if (targetUserId || targetUsername) {
          dispatch(updateAuthorBlockStatus({ userId: targetUserId, username: targetUsername, isBlocked: true }));
          window.dispatchEvent(
            new CustomEvent('author-block-changed', {
              detail: { userId: targetUserId, username: targetUsername, isBlocked: true },
            })
          );
        }
      }
    } else if (action === 'report') {
      setIsReportModalOpen(true);
    } else if (action === 'delete') {
      setIsDeleteModalOpen(true);
    } else if (action === 'edit') {
      setIsEditModalOpen(true);
    } else if (action === 'insights') {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Số liệu phân tích bài viết (Insights)' },
        })
      );
    } else if (action === 'pin') {
      setIsPinned((prev) => !prev);
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: isPinned ? 'Đã bỏ ghim khỏi trang cá nhân' : 'Đã ghim vào trang cá nhân' },
        })
      );
    } else if (action === 'archive') {
      setIsArchived((prev) => !prev);
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: isArchived ? 'Đã khôi phục từ lưu trữ' : 'Đã lưu trữ bài viết' },
        })
      );
    } else if (action === 'toggle_hide_counts') {
      setIsHideLikes((prev) => !prev);
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: isHideLikes ? 'Đã hiện số lượt thích và chia sẻ' : 'Đã ẩn số lượt thích và chia sẻ' },
        })
      );
    } else if (action === 'post_options') {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Tuỳ chọn bài viết' },
        })
      );
    }
  };

  // Xác nhận xoá bài viết trong DeletePostConfirmModal
  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false);
    const currentPostId = postId || post?.id;
    if (!currentPostId) return;

    // Xoá lạc quan ngay lập tức khỏi feed Redux
    dispatch(removeFeedPost(currentPostId));

    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { message: 'Đã xoá bài viết ✨' },
      })
    );

    try {
      await deletePostApi(currentPostId);
    } catch (err) {
      console.error('Delete post error:', err);
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Không thể xoá bài viết. Vui lòng thử lại.' },
        })
      );
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-3 relative"
      onClick={(e) => e.stopPropagation()}
    >
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
          isOwnPost={isOwnPost}
          createdAt={post?.createdAt || post?.raw?.created_at || post?.created_at}
          timestamp={timestamp || post?.timestamp}
          isSaved={isSaved}
          isMuted={isMuted}
          isRestricted={isRestricted}
          isBlocked={isBlocked}
          isPinned={isPinned}
          isArchived={isArchived}
          isHideLikes={isHideLikes}
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

      {/* Modal xác nhận Block người dùng */}
      <BlockConfirmModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        author={author}
        onConfirmBlock={handleConfirmBlock}
      />

      {/* Modal xác nhận Xoá bài viết của chính mình */}
      <DeletePostConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Modal Chỉnh sửa bài viết (Edit Post Modal) */}
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={post || { id: postId, author, content: post?.content, tag }}
        currentUser={currentUser}
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

      {/* Modal Báo cáo bài viết (Report Modal) */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={postId || post?.id}
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

