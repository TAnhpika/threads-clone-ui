import { ConfirmDialog } from '@/components/common';

/**
 * Modal xác nhận chặn người dùng chuẩn giao diện gốc Threads
 * Tái sử dụng ConfirmDialog với biến thể confirmVariant="primary" (chữ trắng đậm)
 */
export default function BlockConfirmModal({
  isOpen,
  onClose,
  author = {},
  onConfirmBlock,
}) {
  const username = author.username || 'user';

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirmBlock}
      title={`Block ${username}?`}
      description={`${username} won't be able to find your profile or content. No one will see their replies to your posts, and they won't be notified that you blocked them.`}
      cancelText="Cancel"
      confirmText="Block"
      confirmVariant="primary"
    />
  );
}
