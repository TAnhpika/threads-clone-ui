import AuthorProfileModal from './AuthorProfileModal';
import UnfollowConfirmModal from './UnfollowConfirmModal';
import BlockConfirmModal from './BlockConfirmModal';
import DeletePostConfirmModal from './DeletePostConfirmModal';
import EditPostModal from './EditPostModal';
import EmbedModal from './EmbedModal';
import ReportModal from './ReportModal';
import { showToast } from '@/utils/toast';

/**
 * Sub-component tập trung gom 7 Modals liên quan của PostHeader.
 * Giúp PostHeader.jsx gọn gàng, giảm hơn 150 dòng JSX thừa.
 */
export default function PostHeaderModals({
  author = {},
  post = null,
  postId = null,
  currentUser = null,
  timestamp = '',
  tag = '',
  // Profile & Relationship modals
  isProfileModalOpen = false,
  setIsProfileModalOpen,
  onOpenUnfollow,
  isUnfollowModalOpen = false,
  setIsUnfollowModalOpen,
  handleConfirmUnfollow,
  isBlockModalOpen = false,
  setIsBlockModalOpen,
  handleConfirmBlock,
  // Post Action modals
  isDeleteModalOpen = false,
  setIsDeleteModalOpen,
  handleConfirmDelete,
  isEditModalOpen = false,
  setIsEditModalOpen,
  isEmbedModalOpen = false,
  setIsEmbedModalOpen,
  isReportModalOpen = false,
  setIsReportModalOpen,
}) {
  const currentPost = post || {
    id: postId,
    author,
    content: post?.content,
    tag,
    timestamp,
  };
  const currentPostId = postId || post?.id;

  return (
    <>
      {/* 1. Modal Profile tác giả khi click vào tick [✓] */}
      {isProfileModalOpen && (
        <AuthorProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen?.(false)}
          author={author}
          onOpenUnfollow={onOpenUnfollow}
        />
      )}

      {/* 2. Modal xác nhận Unfollow khi click nút Following trong Profile Modal */}
      {isUnfollowModalOpen && (
        <UnfollowConfirmModal
          isOpen={isUnfollowModalOpen}
          onClose={() => setIsUnfollowModalOpen?.(false)}
          author={author}
          onConfirmUnfollow={handleConfirmUnfollow}
        />
      )}

      {/* 3. Modal xác nhận Block người dùng */}
      {isBlockModalOpen && (
        <BlockConfirmModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen?.(false)}
          author={author}
          onConfirmBlock={handleConfirmBlock}
        />
      )}

      {/* 4. Modal xác nhận Xoá bài viết của chính mình */}
      {isDeleteModalOpen && (
        <DeletePostConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen?.(false)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

      {/* 5. Modal Chỉnh sửa bài viết (Edit Post Modal) */}
      {isEditModalOpen && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen?.(false)}
          post={currentPost}
          currentUser={currentUser}
        />
      )}

      {/* 6. Modal Get Embed Code */}
      {isEmbedModalOpen && (
        <EmbedModal
          isOpen={isEmbedModalOpen}
          onClose={() => setIsEmbedModalOpen?.(false)}
          post={currentPost}
          postId={currentPostId}
          onSuccessFeedback={(msg) => {
            showToast(msg);
          }}
        />
      )}

      {/* 7. Modal Báo cáo bài viết (Report Modal) */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen?.(false)}
          postId={currentPostId}
        />
      )}
    </>
  );
}
