import { createSlice } from '@reduxjs/toolkit';

const initialTabState = {
  posts: [],
  page: 1,
  hasMore: true,
  scrollPosition: 0,
  lastClickedPostId: null,
  isLoaded: false,
};

const initialState = {
  forYou: { ...initialTabState },
  following: { ...initialTabState },
  activeFeedType: 'for_you', // 'for_you' | 'following'
};

// Helper để lấy đúng key state theo feedType
const getFeedKey = (feedType) => {
  return feedType === 'following' ? 'following' : 'forYou';
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

    // Cập nhật tương tác bài viết (like, repost, comments count)
    updatePostInteraction: (state, action) => {
      const { postId, updates } = action.payload;
      ['forYou', 'following'].forEach((key) => {
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
  updateAuthorFollowStatus,
  updateAuthorMuteStatus,
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
