import http from '@/utils/http';

/**
 * API Follow / Unfollow người dùng theo ID
 * Endpoint: POST /users/:id/follow
 * @param {string|number} userId - ID của người dùng cần follow
 * @returns {Promise<Object>}
 */
export async function followUserApi(userId) {
  const response = await http.post(`/users/${userId}/follow`);
  return response?.data || response;
}
