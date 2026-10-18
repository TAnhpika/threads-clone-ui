import defaultAvatar from '@/assets/images/default-avatar.svg';

/**
 * Danh sách ảnh chân dung chọn lọc cao cấp (Curated portrait pool)
 * Đa dạng giới tính, phong cách hiện đại, tự nhiên, chuẩn Threads.
 */
const PORTRAIT_POOL = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

/**
 * Trả về avatar hợp lệ cho tác giả bài viết:
 * 1. Nếu tác giả đã có avatar thật (avatar hoặc avatar_url) -> sử dụng luôn.
 * 2. Nếu tác giả chưa có avatar -> tạo avatar chân dung ngẫu nhiên nhưng CỐ ĐỊNH (deterministic) theo username/id.
 *    Nhờ đó, cùng một tác giả ở các bài viết khác nhau hay khi reload sẽ luôn có cùng một avatar.
 *
 * @param {Object|string} author - Thông tin tác giả hoặc username/id
 * @returns {string} URL avatar
 */
export function getAuthorAvatar(author) {
  if (!author) return defaultAvatar;

  // Nếu truyền trực tiếp chuỗi URL
  if (typeof author === 'string') {
    if (author.startsWith('http://') || author.startsWith('https://') || author.startsWith('data:') || author.startsWith('/')) {
      return author;
    }
    // Nếu truyền username string
    author = { username: author };
  }

  // Nếu tác giả đã có avatar cụ thể từ API hoặc profile
  if (author.avatar && author.avatar !== defaultAvatar) {
    return author.avatar;
  }
  if (author.avatar_url) {
    return author.avatar_url;
  }

  // Hash username/id để sinh index cố định
  const key = String(author.id || author.username || author.name || 'user');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % PORTRAIT_POOL.length;
  return PORTRAIT_POOL[index];
}

export { defaultAvatar };
