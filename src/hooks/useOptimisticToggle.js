import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { updatePostInteraction } from '@/features/feed/feedSlice';

/**
 * Custom hook quản lý trạng thái toggle tương tác (Like, Repost, Bookmark)
 * áp dụng kỹ thuật Optimistic Update với khả năng tự động rollback khi API thất bại.
 */
export function useOptimisticToggle({
  postId,
  initialActive = false,
  initialCount = 0,
  type = 'like',
  fieldActive = 'isLiked',
  fieldCount = 'likes',
  apiFn,
  successMessageActive,
  successMessageInactive,
  errorMessage = 'Không thể cập nhật. Vui lòng thử lại.',
  onToast,
  syncRedux = true,
}) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isActive, setIsActive] = useState(Boolean(initialActive));
  const [count, setCount] = useState(Number(initialCount) || 0);

  // Đồng bộ khi props thay đổi từ server hoặc từ Redux
  useEffect(() => {
    setIsActive(Boolean(initialActive));
  }, [initialActive]);

  useEffect(() => {
    setCount(Number(initialCount) || 0);
  }, [initialCount]);

  const toggle = async (e) => {
    e?.stopPropagation?.();

    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-auth-prompt', { detail: { type } }));
      return;
    }

    const prevActive = isActive;
    const prevCount = count;
    const nextActive = !prevActive;
    const nextCount = nextActive ? prevCount + 1 : Math.max(0, prevCount - 1);

    // 1. Optimistic Update ngay lập tức trên UI
    setIsActive(nextActive);
    setCount(nextCount);

    // Đồng bộ lên Redux feed nếu có postId và bật syncRedux
    if (syncRedux && postId) {
      dispatch(
        updatePostInteraction({
          postId,
          updates: {
            [fieldActive]: nextActive,
            [fieldCount]: nextCount,
          },
        })
      );
    }

    // Thông báo Toast thành công nếu có cấu hình message
    const successMsg = nextActive ? successMessageActive : successMessageInactive;
    if (successMsg && onToast) {
      onToast(successMsg);
    }

    // 2. Gọi API ngầm trong nền
    try {
      if (apiFn && postId) {
        await apiFn(postId);
      }
    } catch (err) {
      console.error(`Failed to toggle ${type} on item ${postId}:`, err);
      // 3. Rollback nếu API thất bại
      setIsActive(prevActive);
      setCount(prevCount);
      if (syncRedux && postId) {
        dispatch(
          updatePostInteraction({
            postId,
            updates: {
              [fieldActive]: prevActive,
              [fieldCount]: prevCount,
            },
          })
        );
      }
      if (onToast) {
        onToast(errorMessage);
      }
    }
  };

  return {
    isActive,
    count,
    toggle,
  };
}
