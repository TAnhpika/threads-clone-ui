import { useState, useCallback } from 'react';
import copy from 'copy-to-clipboard';
import { getShareUrl, getPostDetailUrl, getEmbedUrl } from '@/utils/postUrl';

/**
 * Custom hook quản lý URL bài viết và các tác vụ sao chép clipboard
 * @param {Object} options
 * @param {Object} [options.post] - Đối tượng bài viết
 * @param {string|number} [options.postId] - ID bài viết
 * @param {Function} [options.onToast] - Callback hiển thị thông báo
 */
export function useShareUrl({ post, postId, onToast } = {}) {
  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = getShareUrl(post, postId);
  const postUrl = getPostDetailUrl(post, postId);
  const embedUrl = getEmbedUrl(post, postId);

  const copyShareUrl = useCallback(
    (customMsg) => {
      copy(shareUrl);
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      const msg = customMsg || 'Đã sao chép liên kết vào bộ nhớ tạm';
      if (onToast) onToast(msg);
      return shareUrl;
    },
    [shareUrl, onToast]
  );

  const copyPostUrl = useCallback(
    (customMsg) => {
      copy(postUrl);
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(postUrl).catch(() => {});
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      const msg = customMsg || 'Đã sao chép liên kết vào bộ nhớ tạm';
      if (onToast) onToast(msg);
      return postUrl;
    },
    [postUrl, onToast]
  );

  return {
    shareUrl,
    postUrl,
    embedUrl,
    isCopied,
    copyShareUrl,
    copyPostUrl,
  };
}

export default useShareUrl;
