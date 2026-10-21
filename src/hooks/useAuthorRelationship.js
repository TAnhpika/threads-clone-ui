import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  updateAuthorFollowStatus,
  updateAuthorBlockStatus,
} from '@/features/feed/feedSlice';
import {
  followUserApi,
  unfollowUserApi,
  blockUserApi,
} from '@/services/userService';
import { showToast } from '@/utils/toast';

/**
 * Custom Hook quản lý mối quan hệ giữa người dùng hiện tại và tác giả bài viết
 * (Theo dõi, Bỏ theo dõi, Chặn, và đồng bộ trạng thái toàn ứng dụng).
 */
export function useAuthorRelationship({
  author = {},
  post = null,
  currentUser = null,
  isAuthenticated = false,
  showFollowBadge = true,
  onFollow,
}) {
  const dispatch = useDispatch();
  const username = author?.username || 'user';

  const [isFollowed, setIsFollowed] = useState(Boolean(author?.isFollowed));
  const [isMuted, setIsMuted] = useState(Boolean(author?.isMuted));
  const [isRestricted, setIsRestricted] = useState(Boolean(author?.isRestricted));
  const [isBlocked, setIsBlocked] = useState(Boolean(author?.isBlocked));

  // Modal states liên quan đến tác giả
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Xác định xem bài viết có phải của chính mình không
  const isSelf = useMemo(
    () =>
      Boolean(
        currentUser &&
          (currentUser.username === username ||
            (currentUser.id && currentUser.id === author?.id))
      ),
    [currentUser, username, author?.id]
  );

  const isOwnPost = useMemo(
    () =>
      Boolean(
        isSelf ||
          (currentUser &&
            ((author?.id && String(author.id) === String(currentUser.id)) ||
              (author?.username && author.username === currentUser.username) ||
              (post?.author?.id && String(post.author.id) === String(currentUser.id)) ||
              (post?.author?.username && post.author.username === currentUser.username)))
      ),
    [isSelf, currentUser, author, post]
  );

  const shouldRenderFollow = showFollowBadge && !isOwnPost;

  // Tự động đồng bộ khi prop author thay đổi
  useEffect(() => {
    if (author?.isMuted !== undefined) {
      setIsMuted(Boolean(author.isMuted));
    }
  }, [author?.isMuted]);

  useEffect(() => {
    if (author?.isRestricted !== undefined) {
      setIsRestricted(Boolean(author.isRestricted));
    }
  }, [author?.isRestricted]);

  useEffect(() => {
    if (author?.isBlocked !== undefined) {
      setIsBlocked(Boolean(author.isBlocked));
    }
  }, [author?.isBlocked]);

  useEffect(() => {
    if (author?.isFollowed !== undefined) {
      setIsFollowed(Boolean(author.isFollowed));
    }
  }, [author?.isFollowed]);

  // Lắng nghe sự kiện author-mute-changed
  useEffect(() => {
    const handleMuteChange = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const matchId =
        detail.userId && targetUserId && String(detail.userId) === String(targetUserId);
      const matchUser = detail.username && username && detail.username === username;
      if (matchId || matchUser) {
        setIsMuted(Boolean(detail.isMuted));
      }
    };
    window.addEventListener('author-mute-changed', handleMuteChange);
    return () => window.removeEventListener('author-mute-changed', handleMuteChange);
  }, [author?.id, post?.author?.id, post?.raw?.user?.id, username]);

  // Lắng nghe sự kiện author-restrict-changed
  useEffect(() => {
    const handleRestrictChange = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const matchId =
        detail.userId && targetUserId && String(detail.userId) === String(targetUserId);
      const matchUser = detail.username && username && detail.username === username;
      if (matchId || matchUser) {
        setIsRestricted(Boolean(detail.isRestricted));
      }
    };
    window.addEventListener('author-restrict-changed', handleRestrictChange);
    return () => window.removeEventListener('author-restrict-changed', handleRestrictChange);
  }, [author?.id, post?.author?.id, post?.raw?.user?.id, username]);

  // Lắng nghe sự kiện author-block-changed
  useEffect(() => {
    const handleBlockChange = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const matchId =
        detail.userId && targetUserId && String(detail.userId) === String(targetUserId);
      const matchUser = detail.username && username && detail.username === username;
      if (matchId || matchUser) {
        setIsBlocked(Boolean(detail.isBlocked));
      }
    };
    window.addEventListener('author-block-changed', handleBlockChange);
    return () => window.removeEventListener('author-block-changed', handleBlockChange);
  }, [author?.id, post?.author?.id, post?.raw?.user?.id, username]);

  // Click vào nút [+] để Follow
  const handleFollowClick = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      e?.preventDefault?.();

      if (!isAuthenticated) {
        window.dispatchEvent(
          new CustomEvent('open-auth-prompt', { detail: { type: 'follow' } })
        );
        return;
      }

      setIsFollowed(true);
      dispatch(
        updateAuthorFollowStatus({
          userId: author?.id,
          username,
          isFollowed: true,
        })
      );
      showToast(`Đang theo dõi @${username}`);

      try {
        if (author?.id) {
          await followUserApi(author.id);
        }
        onFollow?.(author);
      } catch (error) {
        console.error('Follow user API failed:', error);
        setIsFollowed(false);
        dispatch(
          updateAuthorFollowStatus({
            userId: author?.id,
            username,
            isFollowed: false,
          })
        );
        showToast(`Không thể theo dõi @${username}. Vui lòng thử lại.`);
      }
    },
    [isAuthenticated, author, username, dispatch, onFollow]
  );

  // Click vào badge [✓] để mở AuthorProfileModal
  const handleFollowingBadgeClick = useCallback((e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    setIsProfileModalOpen(true);
  }, []);

  // Mở modal xác nhận Unfollow từ Profile Modal
  const handleOpenUnfollow = useCallback(() => {
    setIsUnfollowModalOpen(true);
  }, []);

  // Xác nhận Unfollow trong UnfollowConfirmModal
  const handleConfirmUnfollow = useCallback(async () => {
    setIsUnfollowModalOpen(false);
    setIsProfileModalOpen(false);

    setIsFollowed(false);
    dispatch(
      updateAuthorFollowStatus({
        userId: author?.id,
        username,
        isFollowed: false,
      })
    );
    showToast(`Đã bỏ theo dõi @${username}`);

    try {
      if (author?.id) {
        await unfollowUserApi(author.id);
      }
    } catch (error) {
      console.error('Unfollow user API failed:', error);
      setIsFollowed(true);
      dispatch(
        updateAuthorFollowStatus({
          userId: author?.id,
          username,
          isFollowed: true,
        })
      );
      showToast(`Không thể huỷ theo dõi @${username}. Vui lòng thử lại.`);
    }
  }, [author?.id, username, dispatch]);

  // Xác nhận Chặn trong BlockConfirmModal
  const handleConfirmBlock = useCallback(async () => {
    setIsBlockModalOpen(false);

    const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
    const targetUsername = username || 'user';

    setIsBlocked(true);
    if (targetUserId || targetUsername) {
      dispatch(
        updateAuthorBlockStatus({
          userId: targetUserId,
          username: targetUsername,
          isBlocked: true,
        })
      );
      window.dispatchEvent(
        new CustomEvent('author-block-changed', {
          detail: {
            userId: targetUserId,
            username: targetUsername,
            isBlocked: true,
          },
        })
      );
    }

    showToast({ message: 'Blocked', duration: 3000 });

    try {
      if (targetUserId) {
        await blockUserApi(targetUserId);
      }
    } catch (err) {
      console.error('Block user failed:', err);
      setIsBlocked(false);
      if (targetUserId || targetUsername) {
        dispatch(
          updateAuthorBlockStatus({
            userId: targetUserId,
            username: targetUsername,
            isBlocked: false,
          })
        );
        window.dispatchEvent(
          new CustomEvent('author-block-changed', {
            detail: {
              userId: targetUserId,
              username: targetUsername,
              isBlocked: false,
            },
          })
        );
      }
      showToast('Không thể chặn người dùng. Vui lòng thử lại.');
    }
  }, [author?.id, post?.author?.id, post?.raw?.user?.id, username, dispatch]);

  return {
    username,
    isSelf,
    isOwnPost,
    shouldRenderFollow,
    isFollowed,
    isMuted,
    isRestricted,
    isBlocked,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isUnfollowModalOpen,
    setIsUnfollowModalOpen,
    isBlockModalOpen,
    setIsBlockModalOpen,
    handleFollowClick,
    handleFollowingBadgeClick,
    handleOpenUnfollow,
    handleConfirmUnfollow,
    handleConfirmBlock,
  };
}
