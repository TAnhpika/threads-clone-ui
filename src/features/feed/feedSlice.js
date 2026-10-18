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
