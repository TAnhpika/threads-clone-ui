import http from '@/utils/http';

/**
 * API Follow người dùng theo ID
 * Endpoint: POST /users/:id/follow
 * @param {string|number} userId - ID của người dùng cần follow
 * @returns {Promise<Object>}
 */
export async function followUserApi(userId) {
  const response = await http.post(`/users/${userId}/follow`);
  return response?.data || response;
}

/**
 * API Unfollow người dùng theo ID (Method Spoofing: _method = DELETE)
 * Endpoint: POST /users/:id/follow kèm body { _method: "DELETE" }
 * @param {string|number} userId - ID của người dùng cần unfollow
 * @returns {Promise<Object>}
 */
export async function unfollowUserApi(userId) {
  const response = await http.post(`/users/${userId}/follow`, {
    _method: 'DELETE',
  });
  return response?.data || response;
}

/**
 * API Tắt tiếng người dùng theo ID
 * Endpoint: POST /users/:id/mute
 * @param {string|number} userId - ID của người dùng cần tắt tiếng
 * @returns {Promise<Object>}
 */
export async function muteUserApi(userId) {
  const response = await http.post(`/users/${userId}/mute`);
  return response?.data || response;
}

/**
 * API Bật lại tiếng người dùng theo ID (Method Spoofing: _method = DELETE)
 * Endpoint: POST /users/:id/mute kèm body { _method: "DELETE" }
 * @param {string|number} userId - ID của người dùng cần bật lại tiếng
 * @returns {Promise<Object>}
 */
export async function unmuteUserApi(userId) {
  const response = await http.post(`/users/${userId}/mute`, {
    _method: 'DELETE',
  });
  return response?.data || response;
}

/**
 * API Giới hạn người dùng theo ID
 * Endpoint: POST /users/:id/restrict
 * @param {string|number} userId - ID của người dùng cần giới hạn
 * @returns {Promise<Object>}
 */
export async function restrictUserApi(userId) {
  const response = await http.post(`/users/${userId}/restrict`);
  return response?.data || response;
}

/**
 * API Bỏ giới hạn người dùng theo ID (Method Spoofing: _method = DELETE)
 * Endpoint: POST /users/:id/restrict kèm body { _method: "DELETE" }
 * @param {string|number} userId - ID của người dùng cần bỏ giới hạn
 * @returns {Promise<Object>}
 */
export async function unrestrictUserApi(userId) {
  const response = await http.post(`/users/${userId}/restrict`, {
    _method: 'DELETE',
  });
  return response?.data || response;
}

/**
 * API Chặn người dùng theo ID
 * Endpoint: POST /users/:id/block
 * @param {string|number} userId - ID người dùng cần chặn
 * @returns {Promise<Object>}
 */
export async function blockUserApi(userId) {
  const response = await http.post(`/users/${userId}/block`);
  return response?.data || response;
}

/**
 * API Bỏ chặn người dùng theo ID (Method Spoofing: _method = DELETE)
 * Endpoint: POST /users/:id/block kèm body { _method: "DELETE" }
 * @param {string|number} userId - ID người dùng cần bỏ chặn
 * @returns {Promise<Object>}
 */
export async function unblockUserApi(userId) {
  const response = await http.post(`/users/${userId}/block`, {
    _method: 'DELETE',
  });
  return response?.data || response;
}

