import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ChevronDown,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Plus,
  Check,
} from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import userAvatar from '@/assets/images/ava.png';
import CreatePostModal from '@/components/post/CreatePostModal';

// Meta Infinity SVG icon
function MetaLogo({ className = 'w-6 h-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 9.5c-1.38-1.78-3.04-2.8-4.83-2.8C4.33 6.7 2 9.07 2 12s2.33 5.3 5.17 5.3c1.79 0 3.45-1.02 4.83-2.8 1.38 1.78 3.04 2.8 4.83 2.8 2.84 0 5.17-2.37 5.17-5.3s-2.33-5.3-5.17-5.3c-1.79 0-3.45 1.02-4.83 2.8zm-4.83 5.7c-1.66 0-3.07-1.45-3.07-3.2s1.41-3.2 3.07-3.2c1.37 0 2.76.99 3.83 2.45-1.07 1.46-2.46 2.45-3.83 2.45zm9.66 0c-1.37 0-2.76-.99-3.83-2.45 1.07-1.46 2.46-2.45 3.83-2.45 1.66 0 3.07 1.45 3.07 3.2s-1.41 3.2-3.07 3.2z" />
    </svg>
  );
}

const mockActivities = [
  {
    id: 'act-1',
    type: 'suggested_thread',
    filterCategory: 'All',
    author: {
      name: 'long.weyd_11',
      username: 'long.weyd_11',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    },
    subtitle: 'Suggested thread',
    timestamp: '1h',
    content: 'Eshay ở Úc 👹\nT đi làm thêm về trên bus 220. Đang ngồi nghe nhạc anh t (MCK) thì tự nhiên mọi người từ cuối bus chạy lên đầu hết. T quay qua thì thấy 1 đứa eshay đang đấm 1...',
    likes: 74,
    comments: 22,
    reposts: 0,
    shares: 53,
    postId: 'DeZUpPAj_q6',
  },
  {
    id: 'act-2',
    type: 'system_meta',
    filterCategory: 'All',
    title: 'We updated your settings after 2 accounts were added to the same Accounts Center.',
    timestamp: '1w',
  },
  {
    id: 'act-3',
    type: 'follow',
    filterCategory: 'Follows',
    user: {
      name: 'm.ylittlesecret_',
      username: 'm.ylittlesecret_',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    actionText: 'bắt đầu theo dõi bạn.',
    timestamp: '3h',
    isFollowingBack: false,
  },
  {
    id: 'act-4',
    type: 'reply',
    filterCategory: 'Replies',
    user: {
      name: 'miniature.station',
      username: 'miniature.station',
      avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120&auto=format&fit=crop&q=80',
    },
    actionText: 'đã trả lời bài viết của bạn: "bay cho lắm vào r thất nghiệp :))))))"',
    timestamp: '12h',
    postId: 'DeZUpPAj_q6',
  },
  {
    id: 'act-5',
    type: 'like',
    filterCategory: 'All',
    user: {
      name: 'haikts2000yahoocom',
      username: 'haikts2000yahoocom',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    actionText: 'đã thích câu trả lời của bạn.',
    timestamp: '1d',
    postId: 'DeZUpPAj_q6',
  },
  {
    id: 'act-6',
    type: 'mention',
    filterCategory: 'Mentions',
    user: {
      name: 'Alexander Vance',
      username: 'alexander.sartorial',
      avatar: userAvatar,
    },
    actionText: 'đã nhắc đến bạn trong một bài viết về phong cách quý ông.',
    timestamp: '2d',
    postId: 'post-oldmoney-1',
  },
];

const filterCategories = [
  'All',
  'Follows',
  'Replies',
  'Mentions',
  'Quotes',
  'Reposts',
  'Verified',
];

export default function ActivityPage() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [activities, setActivities] = useState(mockActivities);
  const [toastMessage, setToastMessage] = useState(null);

  // Floating create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('bottom-right');

  const filterRef = useRef(null);
  const optionsRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle theo dõi lại
  const handleToggleFollow = (id) => {
    setActivities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isFollowingBack;
          showToast(nextState ? 'Đã theo dõi lại' : 'Đã bỏ theo dõi');
          return { ...item, isFollowingBack: nextState };
        }
        return item;
      })
    );
  };

  // Lọc hoạt động theo danh mục được chọn
  const filteredActivities = activities.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.filterCategory === selectedFilter;
  });

  return (
    <div className="flex justify-center items-start w-full relative">
      <div className="w-full max-w-155 min-w-0">
        {/* Header: Activity All ⌵ ... */}
        <header className="relative flex items-center justify-between py-2 px-1 mb-2 select-none">
          {/* Tiêu đề Activity & Dropdown Lọc */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="flex items-center gap-1.5 font-bold text-base text-black dark:text-white cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span>Activity</span>
              <span className="font-normal text-zinc-500 flex items-center gap-0.5 ml-0.5 text-sm">
                <span>{selectedFilter}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400 stroke-2" />
              </span>
            </button>

            {/* Menu Dropdown Bộ Lọc */}
            {isFilterOpen && (
              <div
                className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                role="menu"
              >
                {filterCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedFilter(cat);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left ${
                      selectedFilter === cat
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedFilter === cat && (
                      <Check className="w-4 h-4 stroke-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nút tuỳ chọn (...) hình tròn viền mỏng */}
          <div className="relative" ref={optionsRef}>
            <button
              onClick={() => setIsOptionsOpen((prev) => !prev)}
              className="w-7 h-7 rounded-full border border-zinc-300 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Tuỳ chọn thông báo"
            >
              <MoreHorizontal className="w-4 h-4 stroke-2" />
            </button>

            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    showToast('Đã đánh dấu tất cả là đã đọc');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Đánh dấu tất cả đã đọc
                </button>
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    showToast('Cài đặt thông báo');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Cài đặt thông báo
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Khung Card chính bo góc chứa danh sách thông báo */}
        <main className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden transition-colors divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              Chưa có hoạt động nào trong mục này.
            </div>
          ) : (
            filteredActivities.map((item) => {
              // 1. Dạng Suggested Thread (giống ảnh mẫu)
              if (item.type === 'suggested_thread') {
                return (
                  <article
                    key={item.id}
                    onClick={() => navigate(`/@${item.author.username}/post/${item.postId}`)}
                    className="p-4 sm:p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/25 transition-colors cursor-pointer"
                  >
                    {/* Header: Avatar, Name, Timestamp & More */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.author.avatar}
                          alt={item.author.username}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="font-bold text-black dark:text-white hover:underline truncate">
                              {item.author.username}
                            </span>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast('Tuỳ chọn bài viết');
                        }}
                        className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4 stroke-2" />
                      </button>
                    </div>

                    {/* Nội dung bài viết */}
                    <div className="mt-3 pl-13 text-sm sm:text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100 whitespace-pre-line">
                      {item.content}
                    </div>

                    {/* Thanh tương tác */}
                    <div className="pl-13 flex items-center gap-5 mt-3 text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast('Đã thích');
                        }}
                        className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 stroke-2" />
                        <span>{item.likes}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/@${item.author.username}/post/${item.postId}`);
                        }}
                        className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 stroke-2" />
                        <span>{item.comments}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast('Đã đăng lại');
                        }}
                        className="flex items-center gap-1.5 hover:text-green-500 transition-colors cursor-pointer"
                      >
                        <Repeat2 className="w-4 h-4 stroke-2" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast('Đã sao chép liên kết');
                        }}
                        className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4 stroke-2" />
                        <span>{item.shares}</span>
                      </button>
                    </div>
                  </article>
                );
              }

              // 2. Dạng Thông báo hệ thống Meta Accounts Center (giống ảnh mẫu)
              if (item.type === 'system_meta') {
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex items-start gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/25 transition-colors cursor-pointer"
                    onClick={() => showToast('Mở Trung tâm tài khoản')}
                  >
                    <div className="shrink-0 text-blue-500 pt-0.5">
                      <MetaLogo className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal text-zinc-900 dark:text-zinc-100 leading-snug">
                        {item.title}
                      </p>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-1">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                );
              }

              // 3. Dạng Thông báo theo dõi (Follow)
              if (item.type === 'follow') {
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/25 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.user.avatar}
                        alt={item.user.username}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                      />
                      <div className="min-w-0 text-sm">
                        <span className="font-bold text-black dark:text-white hover:underline">
                          {item.user.username}
                        </span>{' '}
                        <span className="text-zinc-600 dark:text-zinc-300">
                          {item.actionText}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-0.5">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(item.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                        item.isFollowingBack
                          ? 'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                      }`}
                    >
                      {item.isFollowingBack ? 'Đang theo dõi' : 'Theo dõi lại'}
                    </button>
                  </div>
                );
              }

              // 4. Dạng Thông báo Reply / Mention / Like
              return (
                <div
                  key={item.id}
                  onClick={() => item.postId && navigate(`/post/${item.postId}`)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/25 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.user.avatar}
                      alt={item.user.username}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                    />
                    <div className="min-w-0 text-sm">
                      <span className="font-bold text-black dark:text-white hover:underline">
                        {item.user.username}
                      </span>{' '}
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {item.actionText}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-0.5">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>

      {/* 1. Nút outline sổ ghi chép [+] ở mép phải giữa màn hình */}
      {isAuthenticated && (
        <button
          onClick={() => {
            setCreateModalPlacement('bottom-right');
            setIsCreateModalOpen(true);
          }}
          className="fixed right-6 sm:right-8 top-1/2 -translate-y-1/2 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors z-40 cursor-pointer hidden lg:block"
          title="Tạo Thread mới"
          aria-label="Tạo Thread mới"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M8 3v18" />
            <path d="M15 9v6" />
            <path d="M12 12h6" />
          </svg>
        </button>
      )}

      {/* 2. Nút nổi vuông bo góc dấu cộng [+] ở góc dưới bên phải */}
      {isAuthenticated && (
        <button
          id="floating-new-thread-btn"
          onClick={() => {
            setCreateModalPlacement('bottom-right');
            setIsCreateModalOpen(true);
          }}
          className="fixed bottom-6 right-6 sm:right-8 w-14 h-14 rounded-2xl bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
          title="Tạo Thread mới"
          aria-label="Tạo Thread mới"
        >
          <Plus className="w-7 h-7 stroke-2" />
        </button>
      )}

      {/* Modal tạo bài viết */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onSubmitPost={() => {
          showToast('Đã đăng bài viết mới thành công ✨');
        }}
        placement={createModalPlacement}
      />

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs sm:text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
