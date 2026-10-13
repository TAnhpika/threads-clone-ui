import { mockPosts } from '@/components/post/mockPosts';

/**
 * Giả lập API gọi danh sách bài viết thời trang
 * @param {number} delay - Thời gian delay giả lập (ms)
 * @returns {Promise<Array>}
 */
export async function getPostsApi(delay = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockPosts]);
    }, delay);
  });
}

/**
 * Giả lập API lấy chi tiết 1 bài viết theo ID
 * @param {string} id
 */
export async function getPostByIdApi(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = mockPosts.find((p) => p.id === id);
      if (post) {
        resolve({ ...post });
      } else {
        reject(new Error('Post not found'));
      }
    }, 100);
  });
}
