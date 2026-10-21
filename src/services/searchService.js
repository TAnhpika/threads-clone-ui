import http from '@/utils/http';

/**
 * Tìm kiếm tổng hợp cả Topics và Users
 * Endpoint: GET /search
 * @param {Object} params
 * @param {string} params.q - Từ khóa tìm kiếm (bắt buộc, tối thiểu 2 ký tự)
 * @param {number} [params.page=1] - Số trang
 * @param {number} [params.per_page_topics=10] - Số lượng topics mỗi trang
 * @param {number} [params.per_page_users=20] - Số lượng users mỗi trang
 * @returns {Promise<{ success: boolean, data: { topics: Array, users: Array }, pagination: Object }>}
 */
export async function searchApi({
  q,
  page = 1,
  per_page_topics = 10,
  per_page_users = 20,
} = {}) {
  const response = await http.get('/search', {
    params: {
      q,
      page,
      per_page_topics,
      per_page_users,
    },
  });
  return response;
}

/**
 * Tìm kiếm riêng Topics
 * Endpoint: GET /topics/search
 * @param {Object} params
 * @param {string} params.q - Từ khóa tìm kiếm
 * @returns {Promise<{ success: boolean, data: Array }>}
 */
export async function searchTopicsApi({ q } = {}) {
  const response = await http.get('/topics/search', {
    params: { q },
  });
  return response;
}

/**
 * Lấy danh sách gợi ý theo dõi (Follow Suggestions)
 * Endpoint: GET /users/suggestions
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.per_page=20]
 * @returns {Promise<{ success: boolean, data: Array, pagination: Object }>}
 */
export async function getFollowSuggestionsApi({ page = 1, per_page = 20 } = {}) {
  const response = await http.get('/users/suggestions', {
    params: { page, per_page },
  });
  return response;
}
