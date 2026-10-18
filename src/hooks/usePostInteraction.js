import { useOptimisticToggle } from './useOptimisticToggle';
import { likePostApi, repostPostApi } from '@/services/postService';

/**
 * Composite Hook quản lý tương tác Like và Repost của bài viết / bình luận.
 * Đóng gói toàn bộ logic Optimistic Update, Redux sync và Rollback.
 */
export function usePostInteraction({
  postId,
  initialLikes = 0,
  initialIsLiked = false,
  initialReposts = 0,
  initialIsReposted = false,
  onToast,
  syncRedux = true,
}) {
  const like = useOptimisticToggle({
    postId,
    initialActive: initialIsLiked,
    initialCount: initialLikes,
    type: 'like',
    fieldActive: 'isLiked',
    fieldCount: 'likes',
    apiFn: likePostApi,
    errorMessage: 'Không thể cập nhật lượt thích. Vui lòng thử lại.',
    onToast,
    syncRedux,
  });

  const repost = useOptimisticToggle({
    postId,
    initialActive: initialIsReposted,
    initialCount: initialReposts,
    type: 'repost',
    fieldActive: 'isReposted',
    fieldCount: 'reposts',
    apiFn: repostPostApi,
    successMessageActive: 'Đã đăng lại bài viết',
    successMessageInactive: 'Đã hủy đăng lại',
    errorMessage: 'Không thể cập nhật lượt đăng lại. Vui lòng thử lại.',
    onToast,
    syncRedux,
  });

  return {
    isLiked: like.isActive,
    likes: like.count,
    toggleLike: like.toggle,
    isReposted: repost.isActive,
    reposts: repost.count,
    toggleRepost: repost.toggle,
  };
}
