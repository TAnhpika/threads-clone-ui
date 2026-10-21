import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  updatePostHideStatus,
  updateAuthorMuteStatus,
  updateAuthorRestrictStatus,
  updateAuthorBlockStatus,
  updatePostInteraction,
  removeFeedPost,
} from '@/features/feed/feedSlice';
import {
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
  deletePostApi,
} from '@/services/postService';
import { showToast } from '@/utils/toast';

/**
 * Custom Hook quản lý 13+ hành động trong PostMenu và trạng thái các Modal tương ứng
 * (Lưu, ẩn, tắt tiếng, hạn chế, xoá, nhúng, báo cáo, ghim, lưu trữ, ẩn lượt thích...).
 */
export function usePostMenuActions({
  post = null,
  postId = null,
  author = {},
  isOwnPost = false,
  shareUrl = '',
  currentUser = null,
  isAuthenticated = false,
  onOpenBlockModal,
}) {
  const dispatch = useDispatch();
  const currentPostId = postId || post?.id;
  const username = author?.username || 'user';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isSaved, setIsSaved] = useState(Boolean(post?.isSaved));
  const [isPinned, setIsPinned] = useState(Boolean(post?.isPinned));
  const [isArchived, setIsArchived] = useState(Boolean(post?.isArchived));
  const [isHideLikes, setIsHideLikes] = useState(Boolean(post?.isHideLikes));

  // Đồng bộ trạng thái lưu bài viết từ prop post
  useEffect(() => {
    if (post?.isSaved !== undefined) {
      setIsSaved(Boolean(post.isSaved));
    }
  }, [post?.isSaved]);

  const handleAction = useCallback(
    async (action) => {
      const targetUserId = author?.id || post?.author?.id || post?.raw?.user?.id;
      const targetUsername = username || 'user';

      if (action === 'copy_link') {
        showToast('Đã sao chép liên kết vào bộ nhớ tạm');
      } else if (action === 'embed') {
        setIsEmbedModalOpen(true);
      } else if (action === 'create_feed') {
        window.dispatchEvent(new CustomEvent('open-create-feed'));
      } else if (action === 'save') {
        if (!isAuthenticated) {
          window.dispatchEvent(
            new CustomEvent('open-auth-prompt', { detail: { type: 'save' } })
          );
          return;
        }
        setIsSaved(true);
        if (currentPostId) {
          dispatch(
            updatePostInteraction({
              postId: currentPostId,
              updates: { isSaved: true },
            })
          );
        }
        showToast('Đã lưu bài viết');

        try {
          if (currentPostId) {
            await savePostApi(currentPostId);
          }
        } catch (err) {
          console.error('Save post failed:', err);
          setIsSaved(false);
          if (currentPostId) {
            dispatch(
              updatePostInteraction({
                postId: currentPostId,
                updates: { isSaved: false },
              })
            );
          }
          showToast('Không thể lưu bài viết. Vui lòng thử lại.');
        }
      } else if (action === 'unsave') {
        if (!isAuthenticated) {
          window.dispatchEvent(
            new CustomEvent('open-auth-prompt', { detail: { type: 'save' } })
          );
          return;
        }
        setIsSaved(false);
        if (currentPostId) {
          dispatch(
            updatePostInteraction({
              postId: currentPostId,
              updates: { isSaved: false },
            })
          );
        }
        showToast('Đã bỏ lưu bài viết');

        try {
          if (currentPostId) {
            await unsavePostApi(currentPostId);
          }
        } catch (err) {
          console.error('Unsave post failed:', err);
          setIsSaved(true);
          if (currentPostId) {
            dispatch(
              updatePostInteraction({
                postId: currentPostId,
                updates: { isSaved: true },
              })
            );
          }
          showToast('Không thể bỏ lưu bài viết. Vui lòng thử lại.');
        }
      } else if (action === 'not_interested') {
        if (currentPostId) {
          dispatch(
            updatePostHideStatus({ postId: currentPostId, isHidden: true })
          );
          window.dispatchEvent(
            new CustomEvent('post-hide-changed', {
              detail: { postId: currentPostId, isHidden: true },
            })
          );
        }

        showToast({ message: 'Hidden', duration: 3000 });

        try {
          if (currentPostId) {
            await hidePostApi(currentPostId);
          }
        } catch (err) {
          console.error('Hide post failed:', err);
          if (currentPostId) {
            dispatch(
              updatePostHideStatus({ postId: currentPostId, isHidden: false })
            );
            window.dispatchEvent(
              new CustomEvent('post-hide-changed', {
                detail: { postId: currentPostId, isHidden: false },
              })
            );
          }
          showToast('Không thể ẩn bài viết. Vui lòng thử lại.');
        }
      } else if (action === 'mute') {
        if (!isAuthenticated) {
          window.dispatchEvent(
            new CustomEvent('open-auth-prompt', { detail: { type: 'mute' } })
          );
          return;
        }

        if (targetUserId || targetUsername) {
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

        showToast({ message: 'Muted', duration: 3000 });

        try {
          if (targetUserId) {
            await muteUserApi(targetUserId);
          }
        } catch (err) {
          console.error('Mute user failed:', err);
          if (targetUserId || targetUsername) {
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
          }
        }
      } else if (action === 'unmute') {
        if (!isAuthenticated) {
          window.dispatchEvent(
            new CustomEvent('open-auth-prompt', { detail: { type: 'mute' } })
          );
          return;
        }

        if (targetUserId || targetUsername) {
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
        }

        showToast({ message: 'Unmuted', duration: 2500 });

        try {
          if (targetUserId) {
            await unmuteUserApi(targetUserId);
          }
        } catch (err) {
          console.error('Unmute user failed:', err);
          if (targetUserId || targetUsername) {
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
        }
      } else if (action === 'restrict') {
        if (!isAuthenticated) {
          window.dispatchEvent(
            new CustomEvent('open-auth-prompt', { detail: { type: 'restrict' } })
          );
          return;
        }

        if (targetUserId || targetUsername) {
          dispatch(
            updateAuthorRestrictStatus({
              userId: targetUserId,
              username: targetUsername,
              isRestricted: true,
            })
          );
          window.dispatchEvent(
            new CustomEvent('author-restrict-changed', {
              detail: {
                userId: targetUserId,
                username: targetUsername,
                isRestricted: true,
              },
            })
          );
        }

        showToast({ message: 'Restricted', duration: 3000 });

        try {
          if (targetUserId) {
            await restrictUserApi(targetUserId);
          }
        } catch (err) {
          console.error('Restrict user failed:', err);
          if (targetUserId || targetUsername) {
            dispatch(
              updateAuthorRestrictStatus({
                userId: targetUserId,
                username: targetUsername,
                isRestricted: false,
              })
            );
            window.dispatchEvent(
              new CustomEvent('author-restrict-changed', {
                detail: {
                  userId: targetUserId,
                  username: targetUsername,
                  isRestricted: false,
                },
              })
            );
          }
        }
      } else if (action === 'unrestrict') {
        if (!isAuthenticated) {
          window.dispatchEvent(
            new CustomEvent('open-auth-prompt', { detail: { type: 'restrict' } })
          );
          return;
        }

        if (targetUserId || targetUsername) {
          dispatch(
            updateAuthorRestrictStatus({
              userId: targetUserId,
              username: targetUsername,
              isRestricted: false,
            })
          );
          window.dispatchEvent(
            new CustomEvent('author-restrict-changed', {
              detail: {
                userId: targetUserId,
                username: targetUsername,
                isRestricted: false,
              },
            })
          );
        }

        showToast({ message: 'Unrestricted', duration: 2500 });

        try {
          if (targetUserId) {
            await unrestrictUserApi(targetUserId);
          }
        } catch (err) {
          console.error('Unrestrict user failed:', err);
          if (targetUserId || targetUsername) {
            dispatch(
              updateAuthorRestrictStatus({
                userId: targetUserId,
                username: targetUsername,
                isRestricted: true,
              })
            );
            window.dispatchEvent(
              new CustomEvent('author-restrict-changed', {
                detail: {
                  userId: targetUserId,
                  username: targetUsername,
                  isRestricted: true,
                },
              })
            );
          }
        }
      } else if (action === 'block') {
        if (!isAuthenticated) {
          window.dispatchEvent(
            new CustomEvent('open-auth-prompt', { detail: { type: 'block' } })
          );
          return;
        }
        onOpenBlockModal?.();
      } else if (action === 'unblock') {
        if (!isAuthenticated) {
          window.dispatchEvent(
            new CustomEvent('open-auth-prompt', { detail: { type: 'block' } })
          );
          return;
        }

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

        showToast({ message: 'Unblocked', duration: 2500 });

        try {
          if (targetUserId) {
            await unblockUserApi(targetUserId);
          }
        } catch (err) {
          console.error('Unblock user failed:', err);
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
        }
      } else if (action === 'report') {
        setIsReportModalOpen(true);
      } else if (action === 'delete') {
        setIsDeleteModalOpen(true);
      } else if (action === 'edit') {
        setIsEditModalOpen(true);
      } else if (action === 'insights') {
        showToast('Số liệu phân tích bài viết (Insights)');
      } else if (action === 'pin') {
        setIsPinned((prev) => {
          const next = !prev;
          showToast(
            next
              ? 'Đã ghim vào trang cá nhân'
              : 'Đã bỏ ghim khỏi trang cá nhân'
          );
          return next;
        });
      } else if (action === 'archive') {
        setIsArchived((prev) => {
          const nextArchived = !prev;
          if (currentPostId) {
            dispatch(
              updatePostInteraction({
                postId: currentPostId,
                updates: { isArchived: nextArchived },
              })
            );
          }
          showToast(
            nextArchived
              ? 'Đã lưu trữ bài viết'
              : 'Đã khôi phục từ lưu trữ'
          );
          return nextArchived;
        });
      } else if (action === 'toggle_hide_counts') {
        setIsHideLikes((prev) => {
          const next = !prev;
          showToast(
            next
              ? 'Đã ẩn số lượt thích và chia sẻ'
              : 'Đã hiện số lượt thích và chia sẻ'
          );
          return next;
        });
      } else if (action === 'post_options') {
        showToast('Tuỳ chọn bài viết');
      }
    },
    [
      author?.id,
      post?.author?.id,
      post?.raw?.user?.id,
      username,
      isAuthenticated,
      currentPostId,
      dispatch,
      onOpenBlockModal,
    ]
  );

  // Xác nhận xoá bài viết trong DeletePostConfirmModal
  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalOpen(false);
    if (!currentPostId) return;

    // Xoá lạc quan ngay lập tức khỏi feed Redux
    dispatch(removeFeedPost(currentPostId));
    showToast('Đã xoá bài viết ✨');

    try {
      await deletePostApi(currentPostId);
    } catch (err) {
      console.error('Delete post error:', err);
      showToast('Không thể xoá bài viết. Vui lòng thử lại.');
    }
  }, [currentPostId, dispatch]);

  return {
    isMenuOpen,
    setIsMenuOpen,
    isEmbedModalOpen,
    setIsEmbedModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    isSaved,
    isPinned,
    isArchived,
    isHideLikes,
    handleAction,
    handleConfirmDelete,
  };
}
