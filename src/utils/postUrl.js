/**
 * Utility tạo các định dạng URL liên quan đến Post trong Threads
 */

/**
 * Lấy URL chia sẻ ngắn chuẩn Threads: https://domain.com/share/:shareId/
 * Khi mở link này, ShareRedirectPage sẽ tra cứu và chuyển hướng về trang chi tiết bài viết: /@:username/post/:postId
 * @param {Object} post - Đối tượng bài viết
 * @param {string|number} [postId] - ID bài viết
 * @returns {string}
 */
export function getShareUrl(post, postId) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareId = postId || post?.id || 'IKPRLtxQV';
  return `${origin}/share/${shareId}/`;
}

/**
 * Lấy URL chi tiết bài viết dạng trực tiếp: https://domain.com/@:username/post/:postId
 * @param {Object} post - Đối tượng bài viết
 * @param {string|number} [postId] - ID bài viết
 * @returns {string}
 */
export function getPostDetailUrl(post, postId) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const username = post?.author?.username || post?.user?.username || 'user';
  const targetId = postId || post?.id || '';
  return `${origin}/@${username}/post/${targetId}`;
}

/**
 * Lấy URL nhúng iframe của bài viết: https://domain.com/:username/post/:postId/embed
 * @param {Object} post - Đối tượng bài viết
 * @param {string|number} [postId] - ID bài viết
 * @returns {string}
 */
export function getEmbedUrl(post, postId) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const username = post?.author?.username || post?.user?.username || 'user';
  const targetId = postId || post?.id || '';
  return `${origin}/${username}/post/${targetId}/embed`;
}
