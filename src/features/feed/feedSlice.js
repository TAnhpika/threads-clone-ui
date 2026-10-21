import { createSlice } from '@reduxjs/toolkit';

const initialTabState = {
  posts: [],
  page: 1,
  hasMore: true,
  scrollPosition: 0,
  lastClickedPostId: null,
  isLoaded: false,
};

const SAVED_POSTS_STORAGE_KEY = 'threads_saved_posts';
const LIKED_POSTS_STORAGE_KEY = 'threads_liked_posts';

const getInitialSavedPosts = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_POSTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse saved posts from storage:', err);
    return [];
  }
};

const saveSavedPostsToStorage = (posts) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save saved posts to storage:', err);
  }
};

const getInitialLikedPosts = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIKED_POSTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse liked posts from storage:', err);
    return [];
  }
};

const saveLikedPostsToStorage = (posts) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LIKED_POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save liked posts to storage:', err);
  }
};

const initialState = {
  forYou: { ...initialTabState },
  following: { ...initialTabState },
  saved: {
    ...initialTabState,
    posts: getInitialSavedPosts(),
    isLoaded: true,
    hasMore: false,
  },
  liked: {
    ...initialTabState,
    posts: getInitialLikedPosts(),
    isLoaded: true,
    hasMore: false,
  },
  activeFeedType: 'for_you', // 'for_you' | 'following' | 'saved' | 'liked'
};

// Helper để lấy đúng key state theo feedType
const getFeedKey = (feedType) => {
  if (feedType === 'following') return 'following';
  if (feedType === 'saved') return 'saved';
  if (feedType === 'liked') return 'liked';
  return 'forYou';
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    // Lưu danh sách bài viết trang 1 (hoặc khi refresh)
    setFeedData: (state, action) => {
      const { feedType = 'for_you', posts = [], page = 1, hasMore = true } = action.payload;
      const key = getFeedKey(feedType);
      state[key].posts = posts;
      state[key].page = page;
      state[key].hasMore = hasMore;
      state[key].isLoaded = true;

      // Đồng bộ các bài có isSaved: true vào tab saved nếu chưa có
      if (feedType !== 'saved' && Array.isArray(posts)) {
        let hasChanges = false;
        posts.forEach((p) => {
          if (p && p.isSaved) {
            const exists = state.saved.posts.some((sp) => String(sp.id) === String(p.id));
            if (!exists) {
              state.saved.posts.push({ ...p });
              hasChanges = true;
            }
          }
        });
        if (hasChanges) {
          saveSavedPostsToStorage(state.saved.posts);
        }
      }

      // Đồng bộ các bài có isLiked: true vào tab liked nếu chưa có
      if (feedType !== 'liked' && Array.isArray(posts)) {
        let hasLikedChanges = false;
        posts.forEach((p) => {
          if (p && p.isLiked) {
            const exists = state.liked.posts.some((lp) => String(lp.id) === String(p.id));
            if (!exists) {
              state.liked.posts.push({ ...p });
              hasLikedChanges = true;
            }
          }
        });
        if (hasLikedChanges) {
          saveLikedPostsToStorage(state.liked.posts);
        }
      }
    },

    // Nối thêm bài viết khi cuộn chạm đáy (Infinite load)
    appendFeedData: (state, action) => {
      const { feedType = 'for_you', posts = [], page = 1, hasMore = true } = action.payload;
      const key = getFeedKey(feedType);
      const existingIds = new Set(state[key].posts.map((p) => p.id));
      const newUniquePosts = posts.filter((p) => !existingIds.has(p.id));
      state[key].posts = [...state[key].posts, ...newUniquePosts];
      state[key].page = page;
      state[key].hasMore = hasMore;
      state[key].isLoaded = true;
    },

    // Lưu vị trí cuộn trang và bài viết vừa click
    saveFeedScroll: (state, action) => {
      const { feedType = 'for_you', scrollPosition = 0, lastClickedPostId = null } = action.payload;
      const key = getFeedKey(feedType);
      state[key].scrollPosition = Math.max(0, scrollPosition);
      if (lastClickedPostId !== null && lastClickedPostId !== undefined) {
        state[key].lastClickedPostId = lastClickedPostId;
      }
    },

    // Thêm bài viết mới do người dùng vừa đăng vào đầu feed
    prependFeedPost: (state, action) => {
      const { feedType = 'for_you', post } = action.payload;
      if (!post) return;
      const key = getFeedKey(feedType);
      state[key].posts = [post, ...state[key].posts];
    },

    // Cập nhật tương tác bài viết (like, repost, comments count, save)
    updatePostInteraction: (state, action) => {
      const { postId, updates } = action.payload;
      let targetPost = null;

      // 1. Cập nhật tương tác trên tất cả các tab
      ['forYou', 'following', 'saved', 'liked'].forEach((key) => {
        if (!state[key]) return;
        const post = state[key].posts.find((p) => String(p.id) === String(postId));
        if (post) {
          Object.assign(post, updates);
          if (!targetPost) targetPost = post;
        }
      });

      // 2. Xử lý đồng bộ Saved posts khi có thay đổi isSaved
      if (updates && updates.isSaved !== undefined) {
        if (updates.isSaved === true) {
          const exists = state.saved.posts.some((p) => String(p.id) === String(postId));
          if (!exists) {
            const postToAdd =
              targetPost ||
              state.forYou.posts.find((p) => String(p.id) === String(postId)) ||
              state.following.posts.find((p) => String(p.id) === String(postId)) ||
              state.liked.posts.find((p) => String(p.id) === String(postId));
            if (postToAdd) {
              state.saved.posts.unshift({ ...postToAdd, isSaved: true });
              saveSavedPostsToStorage(state.saved.posts);
            }
          }
        } else if (updates.isSaved === false) {
          const beforeLen = state.saved.posts.length;
          state.saved.posts = state.saved.posts.filter((p) => String(p.id) !== String(postId));
          if (state.saved.posts.length !== beforeLen) {
            saveSavedPostsToStorage(state.saved.posts);
          }
        }
      }

      // 3. Xử lý đồng bộ Liked posts khi có thay đổi isLiked
      if (updates && updates.isLiked !== undefined) {
        if (updates.isLiked === true) {
          const exists = state.liked.posts.some((p) => String(p.id) === String(postId));
          if (!exists) {
            const postToAdd =
              targetPost ||
              state.forYou.posts.find((p) => String(p.id) === String(postId)) ||
              state.following.posts.find((p) => String(p.id) === String(postId)) ||
              state.saved.posts.find((p) => String(p.id) === String(postId));
            if (postToAdd) {
              state.liked.posts.unshift({ ...postToAdd, isLiked: true });
              saveLikedPostsToStorage(state.liked.posts);
            }
          }
        } else if (updates.isLiked === false) {
          const beforeLen = state.liked.posts.length;
          state.liked.posts = state.liked.posts.filter((p) => String(p.id) !== String(postId));
          if (state.liked.posts.length !== beforeLen) {
            saveLikedPostsToStorage(state.liked.posts);
          }
        }
      }
    },

    // Cập nhật nội dung và dữ liệu bài viết sau khi Edit
    updatePostData: (state, action) => {
      const { postId, updates } = action.payload;
      ['forYou', 'following', 'saved', 'liked'].forEach((key) => {
        if (!state[key]) return;
        const post = state[key].posts.find((p) => String(p.id) === String(postId));
        if (post) {
          Object.assign(post, updates);
        }
      });
    },

    // Cập nhật trạng thái follow của một tác giả trên toàn bộ feed
    updateAuthorFollowStatus: (state, action) => {
      const { userId, username, isFollowed } = action.payload;
      ['forYou', 'following'].forEach((key) => {
        state[key].posts.forEach((post) => {
          const matchId = userId && post.author?.id && String(post.author.id) === String(userId);
          const matchUsername = username && post.author?.username === username;
          if (matchId || matchUsername) {
            if (post.author) {
              post.author.isFollowed = isFollowed;
            }
          }
        });
      });
    },

    // Cập nhật trạng thái mute của một tác giả trên toàn bộ feed
    updateAuthorMuteStatus: (state, action) => {
      const { userId, username, isMuted } = action.payload;
      ['forYou', 'following'].forEach((key) => {
        state[key].posts.forEach((post) => {
          const matchId = userId && post.author?.id && String(post.author.id) === String(userId);
          const matchUsername = username && post.author?.username === username;
          if (matchId || matchUsername) {
            if (post.author) {
              post.author.isMuted = isMuted;
            }
          }
        });
      });
    },

    // Cập nhật trạng thái restrict của một tác giả trên toàn bộ feed
    updateAuthorRestrictStatus: (state, action) => {
      const { userId, username, isRestricted } = action.payload;
      ['forYou', 'following'].forEach((key) => {
        state[key].posts.forEach((post) => {
          const matchId = userId && post.author?.id && String(post.author.id) === String(userId);
          const matchUsername = username && post.author?.username === username;
          if (matchId || matchUsername) {
            if (post.author) {
              post.author.isRestricted = isRestricted;
            }
          }
        });
      });
    },

    // Cập nhật trạng thái block của một tác giả trên toàn bộ feed
    updateAuthorBlockStatus: (state, action) => {
      const { userId, username, isBlocked } = action.payload;
      ['forYou', 'following'].forEach((key) => {
        state[key].posts.forEach((post) => {
          const matchId = userId && post.author?.id && String(post.author.id) === String(userId);
          const matchUsername = username && post.author?.username === username;
          if (matchId || matchUsername) {
            if (post.author) {
              post.author.isBlocked = isBlocked;
            }
          }
        });
      });
    },

    // Ẩn tất cả bài viết của tác giả khi bị mute
    hidePostsByAuthor: (state, action) => {
      const { userId, username } = action.payload;
      ['forYou', 'following'].forEach((key) => {
        state[key].posts = state[key].posts.filter((post) => {
          const matchId = userId && post.author?.id && String(post.author.id) === String(userId);
          const matchUsername = username && post.author?.username === username;
          return !(matchId || matchUsername);
        });
      });
    },

    // Khôi phục danh sách bài viết vào feed khi hoàn tác mute
    restorePostsByAuthor: (state, action) => {
      const { posts = [] } = action.payload || {};
      if (!Array.isArray(posts) || posts.length === 0) return;
      ['forYou', 'following'].forEach((key) => {
        posts.forEach(({ post, index }) => {
          if (!post) return;
          if (!state[key].posts.some((p) => String(p.id) === String(post.id))) {
            if (typeof index === 'number' && index >= 0 && index <= state[key].posts.length) {
              state[key].posts.splice(index, 0, post);
            } else {
              state[key].posts.push(post);
            }
          }
        });
      });
    },

    // Ẩn / Xoá bài viết khỏi feed
    removeFeedPost: (state, action) => {
      const postId = action.payload;
      ['forYou', 'following'].forEach((key) => {
        state[key].posts = state[key].posts.filter((p) => String(p.id) !== String(postId));
      });
    },

    // Phục hồi bài viết vào feed khi hoàn tác ẩn
    restoreFeedPost: (state, action) => {
      const { post, index } = action.payload || {};
      if (!post) return;
      ['forYou', 'following'].forEach((key) => {
        if (!state[key].posts.some((p) => String(p.id) === String(post.id))) {
          if (typeof index === 'number' && index >= 0 && index <= state[key].posts.length) {
            state[key].posts.splice(index, 0, post);
          } else {
            state[key].posts.unshift(post);
          }
        }
      });
    },

    // Cập nhật trạng thái ẩn bài viết (để hiển thị PostNoticeCard thay vì xóa khỏi mảng)
    updatePostHideStatus: (state, action) => {
      const { postId, isHidden } = action.payload;
      ['forYou', 'following'].forEach((key) => {
        const post = state[key].posts.find((p) => String(p.id) === String(postId));
        if (post) {
          post.isHidden = isHidden;
        }
      });
    },

    // Reset dữ liệu feed
    clearFeed: (state, action) => {
      const feedType = action.payload;
      if (feedType) {
        const key = getFeedKey(feedType);
        state[key] = { ...initialTabState };
      } else {
        state.forYou = { ...initialTabState };
        state.following = { ...initialTabState };
      }
    },
  },
});

export const {
  setFeedData,
  appendFeedData,
  saveFeedScroll,
  prependFeedPost,
  updatePostInteraction,
  updatePostData,
  updateAuthorFollowStatus,
  updateAuthorMuteStatus,
  updateAuthorRestrictStatus,
  updateAuthorBlockStatus,
  updatePostHideStatus,
  hidePostsByAuthor,
  restorePostsByAuthor,
  removeFeedPost,
  restoreFeedPost,
  clearFeed,
} = feedSlice.actions;

// Selectors
export const selectFeedState = (feedType) => (state) => {
  const key = getFeedKey(feedType);
  return state.feed?.[key] || initialTabState;
};

export const selectFeedPosts = (feedType) => (state) => {
  const key = getFeedKey(feedType);
  return state.feed?.[key]?.posts || [];
};

export const selectFeedScroll = (feedType) => (state) => {
  const key = getFeedKey(feedType);
  return {
    scrollPosition: state.feed?.[key]?.scrollPosition || 0,
    lastClickedPostId: state.feed?.[key]?.lastClickedPostId || null,
  };
};

export default feedSlice.reducer;
