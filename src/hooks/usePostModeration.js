import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  updateAuthorMuteStatus,
  updateAuthorBlockStatus,
  updatePostHideStatus,
} from '@/features/feed/feedSlice';
import { unmuteUserApi, unblockUserApi } from '@/services/userService';
import { unhidePostApi } from '@/services/postService';
import { showToast } from '@/utils/toast';

/**
 * Custom Hook quản lý trạng thái kiểm duyệt bài viết (Ẩn, Tắt tiếng, Chặn).
 * Đóng gói toàn bộ logic đồng bộ sự kiện toàn cục và hoàn tác (Undo) kèm rollback.
 */
export function usePostModeration({ post }) {
  const dispatch = useDispatch();

  const [isMuted, setIsMuted] = useState(Boolean(post?.author?.isMuted));
  const [isBlocked, setIsBlocked] = useState(Boolean(post?.author?.isBlocked));
  const [isHidden, setIsHidden] = useState(Boolean(post?.isHidden));

  // Đồng bộ khi prop post thay đổi
  useEffect(() => {
    if (post?.author?.isMuted !== undefined) {
      setIsMuted(Boolean(post.author.isMuted));
    }
  }, [post?.author?.isMuted]);

  useEffect(() => {
    if (post?.author?.isBlocked !== undefined) {
      setIsBlocked(Boolean(post.author.isBlocked));
    }
  }, [post?.author?.isBlocked]);

  useEffect(() => {
    if (post?.isHidden !== undefined) {
      setIsHidden(Boolean(post.isHidden));
    }
  }, [post?.isHidden]);

  // Lắng nghe sự kiện author-mute-changed
  useEffect(() => {
    const handleMuteChange = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetUserId = post?.author?.id || post?.raw?.user?.id;
      const targetUsername = post?.author?.username;
      const matchId =
        detail.userId && targetUserId && String(detail.userId) === String(targetUserId);
      const matchUser =
        detail.username && targetUsername && detail.username === targetUsername;
      if (matchId || matchUser) {
        setIsMuted(Boolean(detail.isMuted));
      }
    };
    window.addEventListener('author-mute-changed', handleMuteChange);
    return () => window.removeEventListener('author-mute-changed', handleMuteChange);
  }, [post?.author?.id, post?.author?.username, post?.raw?.user?.id]);

  // Lắng nghe sự kiện author-block-changed
  useEffect(() => {
    const handleBlockChange = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const targetUserId = post?.author?.id || post?.raw?.user?.id;
      const targetUsername = post?.author?.username;
      const matchId =
        detail.userId && targetUserId && String(detail.userId) === String(targetUserId);
      const matchUser =
        detail.username && targetUsername && detail.username === targetUsername;
      if (matchId || matchUser) {
        setIsBlocked(Boolean(detail.isBlocked));
      }
    };
    window.addEventListener('author-block-changed', handleBlockChange);
    return () => window.removeEventListener('author-block-changed', handleBlockChange);
  }, [post?.author?.id, post?.author?.username, post?.raw?.user?.id]);

  // Lắng nghe sự kiện post-hide-changed
  useEffect(() => {
    const handleHideChange = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      if (detail.postId && String(detail.postId) === String(post?.id)) {
        setIsHidden(Boolean(detail.isHidden));
      }
    };
    window.addEventListener('post-hide-changed', handleHideChange);
    return () => window.removeEventListener('post-hide-changed', handleHideChange);
  }, [post?.id]);

  // Xử lý hoàn tác ẩn bài viết
  const handleUndoHide = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      if (!post?.id) return;

      setIsHidden(false);
      dispatch(updatePostHideStatus({ postId: post.id, isHidden: false }));
      window.dispatchEvent(
        new CustomEvent('post-hide-changed', {
          detail: { postId: post.id, isHidden: false },
        })
      );
      showToast('Unhidden');

      try {
        await unhidePostApi(post.id);
      } catch (err) {
        console.error('Unhide post failed:', err);
        setIsHidden(true);
        dispatch(updatePostHideStatus({ postId: post.id, isHidden: true }));
        window.dispatchEvent(
          new CustomEvent('post-hide-changed', {
            detail: { postId: post.id, isHidden: true },
          })
        );
      }
    },
    [dispatch, post?.id]
  );

  // Xử lý hoàn tác tắt tiếng tác giả
  const handleUndoMute = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      setIsMuted(false);
      const targetUserId = post?.author?.id || post?.raw?.user?.id;
      const targetUsername = post?.author?.username || 'user';

      dispatch(
        updateAuthorMuteStatus({
          userId: targetUserId,
          username: targetUsername,
          isMuted: false,
        })
      );
      window.dispatchEvent(
        new CustomEvent('author-mute-changed', {
          detail: {
            userId: targetUserId,
            username: targetUsername,
            isMuted: false,
          },
        })
      );
      showToast('Unmuted');

      try {
        if (targetUserId) {
          await unmuteUserApi(targetUserId);
        }
      } catch (err) {
        console.error('Unmute user failed:', err);
        setIsMuted(true);
        dispatch(
          updateAuthorMuteStatus({
            userId: targetUserId,
            username: targetUsername,
            isMuted: true,
          })
        );
        window.dispatchEvent(
          new CustomEvent('author-mute-changed', {
            detail: {
              userId: targetUserId,
              username: targetUsername,
              isMuted: true,
            },
          })
        );
      }
    },
    [dispatch, post?.author?.id, post?.author?.username, post?.raw?.user?.id]
  );

  // Xử lý hoàn tác bỏ chặn người dùng
  const handleUndoBlock = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      setIsBlocked(false);
      const targetUserId = post?.author?.id || post?.raw?.user?.id;
      const targetUsername = post?.author?.username || 'user';

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
      showToast('Unblocked');

      try {
        if (targetUserId) {
          await unblockUserApi(targetUserId);
        }
      } catch (err) {
        console.error('Unblock user failed:', err);
        setIsBlocked(true);
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
    },
    [dispatch, post?.author?.id, post?.author?.username, post?.raw?.user?.id]
  );

  // Xác định thông báo hiển thị cho PostNoticeCard (nếu có)
  let noticeMessage = null;
  let handleUndoNotice = null;

  if (isHidden) {
    noticeMessage = 'This post has been hidden.';
    handleUndoNotice = handleUndoHide;
  } else if (isMuted) {
    noticeMessage = `Posts from ${
      post?.author?.username || 'user'
    } are muted. You can manage who you mute in settings.`;
    handleUndoNotice = handleUndoMute;
  } else if (isBlocked) {
    noticeMessage = `Posts from ${post?.author?.username || 'user'} are blocked.`;
    handleUndoNotice = handleUndoBlock;
  }

  return {
    isHidden,
    isMuted,
    isBlocked,
    noticeMessage,
    handleUndoNotice,
    handleUndoHide,
    handleUndoMute,
    handleUndoBlock,
  };
}
