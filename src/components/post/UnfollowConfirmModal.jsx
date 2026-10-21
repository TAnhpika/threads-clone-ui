import { getAuthorAvatar } from '@/utils/avatar';
import { ConfirmDialog } from '@/components/common';

/**
 * Modal xác nhận huỷ theo dõi (Unfollow Confirmation Dialog) chuẩn giao diện Threads
 * Tái sử dụng ConfirmDialog với avatar tròn và confirmVariant="danger" (chữ đỏ)
 */
export default function UnfollowConfirmModal({
  isOpen,
  onClose,
  author = {},
  onConfirmUnfollow,
}) {
  const username = author.username || 'user';
  const avatar = author.avatar || getAuthorAvatar(author);

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirmUnfollow}
      avatar={avatar}
      avatarAlt={username}
      title={`Unfollow ${username}?`}
      cancelText="Cancel"
      confirmText="Unfollow"
      confirmVariant="danger"
    />
  );
}
