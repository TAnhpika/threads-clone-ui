import defaultAvatar from '@/assets/images/default-avatar.svg';

/**
 * Trả về avatar hợp lệ cho tác giả bài viết:
 * 1. Nếu tác giả đã có avatar thật (avatar hoặc avatar_url) -> sử dụng luôn.
 * 2. Nếu tác giả chưa có avatar -> trả về defaultAvatar chuẩn của Threads.
 *
 * @param {Object|string} author - Thông tin tác giả hoặc username/id
 * @returns {string} URL avatar
 */
export function getAuthorAvatar(author) {
  if (!author) return defaultAvatar;

  // Nếu truyền trực tiếp chuỗi URL
  if (typeof author === 'string') {
    if (
      author.startsWith('http://') ||
      author.startsWith('https://') ||
      author.startsWith('data:') ||
      author.startsWith('/')
    ) {
      return author;
    }
    return defaultAvatar;
  }

  // Nếu tác giả đã có avatar cụ thể từ API hoặc profile
  if (author.avatar) {
    return author.avatar;
  }
  if (author.avatar_url) {
    return author.avatar_url;
  }

  return defaultAvatar;
}

export { defaultAvatar };
