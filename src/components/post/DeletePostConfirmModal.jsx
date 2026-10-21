import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/common';

/**
 * Modal xác nhận xoá bài viết chuẩn giao diện gốc Threads
 * Tái sử dụng ConfirmDialog với biến thể confirmVariant="danger" (chữ đỏ)
 */
export default function DeletePostConfirmModal({
  isOpen,
  onClose,
  onConfirmDelete,
  isReply = false,
  title,
  description,
}) {
  const { t } = useTranslation();

  const displayTitle =
    title ||
    (isReply
      ? t('postMenu.deleteReplyTitle', 'Delete reply?')
      : t('postMenu.deletePostTitle', 'Delete post?'));

  const displayDesc =
    description ||
    (isReply
      ? t(
          'postMenu.deleteReplyDesc',
          "If you delete this reply, you won't be able to restore it."
        )
      : t(
          'postMenu.deletePostDesc',
          "If you delete this post, you won't be able to restore it."
        ));

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirmDelete}
      title={displayTitle}
      description={displayDesc}
      cancelText={t('common.cancel', 'Cancel')}
      confirmText={t('common.delete', 'Delete')}
      confirmVariant="danger"
    />
  );
}
