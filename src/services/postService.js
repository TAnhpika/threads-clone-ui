import http from '@/utils/http';
import { mockPosts } from '@/components/post/mockPosts';

/**
 * Format thời gian từ chuỗi ISO thành dạng hiển thị tương đối: vừa xong, 5m, 2h, 3d, 12 thg 10
 * @param {string|Date} dateString
 * @returns {string}
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0 || isNaN(diffMs)) {
    return 'vừa xong';
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'vừa xong';
  }
  if (diffMin < 60) {
    return `${diffMin}m`;
  }
  if (diffHour < 24) {
    return `${diffHour}h`;
  }
  if (diffDay < 7) {
    return `${diffDay}d`;
  }

  // Nếu quá 7 ngày: hiển thị ngày/tháng
  const day = date.getDate();
  const month = date.getMonth() + 1;
  if (date.getFullYear() === now.getFullYear()) {
    return `${day} thg ${month}`;
  }
  return `${day}/${month}/${date.getFullYear()}`;
}

/**
 * Chuẩn hóa đối tượng Post từ API thành format thống nhất cho giao diện PostCard
 * @param {Object} item - Đối tượng post từ server
 * @returns {Object}
 */
export function adaptPost(item) {
  if (!item) return null;
  const user = item.user || {};
  const mediaList = Array.isArray(item.media_urls)
    ? item.media_urls.filter(Boolean)
    : [];

  return {
    id: item.id,
    author: {
      id: user.id,
      name: user.name || user.username || 'User',
      username: user.username || 'user',
      avatar: user.avatar_url || null,
      isVerified: Boolean(user.verified),
      isFollowed: Boolean(user.is_followed_by_auth),
    },
    timestamp: formatTimeAgo(item.created_at),
    createdAt: item.created_at,
    tag: item.topic?.name || null,
    content: item.content || '',
    media:
      mediaList.length > 0
        ? {
            url: mediaList[0],
            urls: mediaList,
          }
        : null,
    likes: item.likes_count || 0,
    comments: item.replies_count || 0,
    reposts: item.reposts_and_quotes_count || 0,
    shares: 0,
    isLiked: Boolean(item.is_liked_by_auth),
    isSaved: Boolean(item.is_saved_by_auth),
    isReposted: Boolean(item.is_reposted_by_auth),
    raw: item,
  };
}

/**
 * Gọi API GET /posts/feed lấy danh sách bài viết trên trang chủ
 * @param {Object} params - { type = 'for_you', page = 1, per_page = 20 }
 * @returns {Promise<{ success: boolean, data: Array, pagination: Object }>}
 */
export async function getFeed({ type = 'for_you', page = 1, per_page = 20 } = {}) {
  const response = await http.get('/posts/feed', {
    params: {
      type,
      page,
      per_page,
    },
  });

  // httpClient response interceptor trả về response.data trực tiếp
  const res = response?.data ? response : { data: response, pagination: null };
  const rawPosts = Array.isArray(res.data) ? res.data : Array.isArray(response) ? response : [];
  const posts = rawPosts.map(adaptPost);

  return {
    success: true,
    data: posts,
    pagination: res.pagination || null,
  };
}

/**
 * API lấy chi tiết 1 bài viết theo ID
 * @param {string|number} id
 */
export async function getPostByIdApi(id) {
  try {
    const response = await http.get(`/posts/${id}`);
    const resData = response?.data || response;
    if (resData) {
      return adaptPost(resData);
    }
  } catch (error) {
    console.warn(`Could not fetch post ${id} from API, falling back to mock:`, error);
  }

  // Fallback sang mockPosts nếu API lỗi hoặc đang chạy offline
  const post = mockPosts.find((p) => String(p.id) === String(id));
  if (post) {
    return { ...post };
  }
  throw new Error('Post not found');
}

/**
 * Giả lập API gọi danh sách bài viết thời trang (backward-compatibility)
 */
export async function getPostsApi(delay = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockPosts]);
    }, delay);
  });
}
