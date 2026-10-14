import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MoreHorizontal,
  Plus,
  SquarePen,
  UserPlus,
  Pencil,
  Check,
  X,
  Lock,
  Globe,
  Share2,
  Copy,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { selectCurrentUser, updateCurrentUser, logout } from '@/features/auth/authSlice';
import userAvatar from '@/assets/images/ava.png';
import CreatePostBox from '@/components/post/CreatePostBox';
import CreatePostModal from '@/components/post/CreatePostModal';
import PostCard from '@/components/post/PostCard';

// Instagram Outline Icon chuẩn Threads
function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const [activeTab, setActiveTab] = useState('threads');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('center');
  const [toastMessage, setToastMessage] = useState(null);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followedIds, setFollowedIds] = useState([]);

  // Carousel Slider state cho khối 'Finish your profile' (0: 3 thẻ đầu, 1: 3 thẻ sau)
  const [slideIndex, setSlideIndex] = useState(0);

  const suggestedProfiles = [
    {
      id: 'p-1',
      name: 'm.ylittlesecret_',
      username: 'm.ylittlesecret_',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      bio: 'Architecture & Design inspiration',
    },
    {
      id: 'p-2',
      name: 'Miniature Station',
      username: 'miniature.station',
      avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120&auto=format&fit=crop&q=80',
      bio: 'Vintage aesthetic & scale models',
    },
    {
      id: 'p-3',
      name: 'Hai KTS',
      username: 'haikts2000yahoocom',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      bio: 'Architect & modern photography',
    },
    {
      id: 'p-4',
      name: 'The Gentleman Archive',
      username: 'the.gentleman.archive',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      bio: 'Classic tailoring & Sartorial style',
    },
    {
      id: 'p-5',
      name: 'Luca Moretti',
      username: 'luca_menswear',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      bio: 'Smart Casual & Italian Sprezzatura',
    },
  ];

  const handleToggleFollow = (id, username) => {
    if (followedIds.includes(id)) {
      setFollowedIds((prev) => prev.filter((i) => i !== id));
      showToast(`Đã bỏ theo dõi @${username}`);
    } else {
      setFollowedIds((prev) => [...prev, id]);
      showToast(`Đang theo dõi @${username}`);
    }
  };

  // Danh sách bài viết của user trên trang profile
  const [userPosts, setUserPosts] = useState([]);

  // Form state cho Edit Profile
  const [editName, setEditName] = useState(currentUser?.name || 'Tuan Anh');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editLink, setEditLink] = useState(currentUser?.link || '');
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate ?? true);
  const [showInstagramBadge, setShowInstagramBadge] = useState(true);
  const [showRecentViews, setShowRecentViews] = useState(true);
  const [interests, setInterests] = useState('');
  const [podcast, setPodcast] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    dispatch(
      updateCurrentUser({
        name: editName.trim() || 'Tuan Anh',
        bio: editBio.trim(),
        link: editLink.trim(),
        isPrivate,
      })
    );
    setIsEditModalOpen(false);
    showToast('Đã lưu thông tin hồ sơ');
  };

  const handleCreatePost = (newPostData) => {
    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        name: currentUser?.name || 'Tuan Anh',
        username: currentUser?.username || 'tuananhpika',
        avatar: currentUser?.avatar || userAvatar,
        isVerified: true,
      },
      tag: newPostData.topic || '',
      timestamp: 'Vừa xong',
      content: newPostData.content,
      media: newPostData.media || null,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
    };
    setUserPosts([newPost, ...userPosts]);
    showToast('Đã đăng bài viết mới ✨');
  };

  const tabs = [
    { id: 'threads', label: 'Threads' },
    { id: 'replies', label: 'Replies' },
    { id: 'media', label: 'Media' },
    { id: 'reposts', label: 'Reposts' },
  ];

  const avatar = currentUser?.avatar || userAvatar;
  const name = currentUser?.name || 'Tuan Anh';
  const username = currentUser?.username || 'tuananhpika';

  return (
    <div className="flex justify-center items-start w-full select-none">
      <div className="flex-1 max-w-155 min-w-0">
        {/* 1. TOP HEADER: Username ở giữa, Search & More ở góc phải */}
        <header className="flex items-center justify-between h-14 px-2 mb-1">
          <div className="w-16" /> {/* Placeholder cân đối lề trái */}
          <span className="font-bold text-base text-black dark:text-white tracking-tight">
            {username}
          </span>
          <div className="flex items-center gap-1.5 relative">
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5 stroke-2" />
            </button>

            <button
              type="button"
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Menu More Popup */}
            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1c1c1c] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setIsMoreMenuOpen(false);
                    showToast('Đã sao chép liên kết trang cá nhân');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left"
                >
                  <Copy className="w-4 h-4" />
                  <span>Sao chép liên kết</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    showToast('Chia sẻ trang cá nhân');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Chia sẻ trang cá nhân</span>
                </button>
                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 2. KHỐI CARD PROFILE CHÍNH (Bo góc chuẩn Threads Web) */}
        <section className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl shadow-xs overflow-hidden transition-colors">
          {/* Header thông tin cá nhân */}
          <div className="p-6 pb-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              {/* Tên & Username */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
                  {name}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-normal">
                  {username}
                </p>
                {currentUser?.bio && (
                  <p className="text-sm text-black dark:text-zinc-200 pt-2 whitespace-pre-wrap leading-relaxed">
                    {currentUser.bio}
                  </p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal pt-3">
                  {currentUser?.followers || 0} followers
                </p>
              </div>

              {/* Avatar & Instagram Button */}
              <div className="flex flex-col items-end shrink-0">
                <img
                  src={avatar}
                  alt={name}
                  className="w-20 h-20 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shadow-xs"
                />
                {showInstagramBadge && (
                  <button
                    type="button"
                    onClick={() => window.open('https://instagram.com', '_blank')}
                    className="mt-3 text-black dark:text-white hover:opacity-75 transition-opacity cursor-pointer p-1"
                    title="Instagram"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2 Nút thao tác: Edit profile & View insights */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEditName(name);
                  setEditBio(currentUser?.bio || '');
                  setEditLink(currentUser?.link || '');
                  setIsPrivate(currentUser?.isPrivate || false);
                  setIsEditModalOpen(true);
                }}
                className="flex-1 py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800/90 font-bold text-sm text-center text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                Edit profile
              </button>
              <button
                type="button"
                onClick={() => navigate('/insights')}
                className="flex-1 py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800/90 font-bold text-sm text-center text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                View insights
              </button>
            </div>
          </div>

          {/* Hàng Tabs: Threads, Replies, Media, Reposts */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800/80">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-semibold text-center transition-colors cursor-pointer border-b-2 ${
                  activeTab === tab.id
                    ? 'border-black dark:border-white text-black dark:text-white'
                    : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* NỘI DUNG THEO TAB */}
          {activeTab === 'threads' && (
            <div>
              {/* Thanh soạn thảo What's new */}
              <CreatePostBox
                user={currentUser}
                onClick={() => {
                  setCreateModalPlacement('center');
                  setIsCreateModalOpen(true);
                }}
              />

              {/* Khối 'Finish your profile' (3 left) có slider Next / Back */}
              <div className="border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center justify-between px-6 pt-5 pb-3.5">
                  <span className="font-bold text-[15px] text-black dark:text-white">
                    Finish your profile
                  </span>
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                    3 left
                  </span>
                </div>

                {/* Container Carousel có nút Back & Continue */}
                <div className="relative px-6 pb-6 group/carousel">
                  {/* Nút Back (trượt về trước) */}
                  {slideIndex > 0 && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 -mt-3 z-30 group/btn">
                      <button
                        type="button"
                        onClick={() => setSlideIndex(0)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/95 dark:bg-[#121212] border border-zinc-700/90 flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        aria-label="Back"
                      >
                        <ArrowLeft className="w-4 h-4 stroke-2" />
                      </button>
                      {/* Tooltip 'Back' có khung viền trắng chuẩn screenshot */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-0.5 bg-black text-white text-[11px] font-medium rounded border border-white/80 shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-40">
                        Back
                      </div>
                    </div>
                  )}

                  {/* Nút Next / Continue (trượt tiếp) */}
                  {slideIndex === 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 -mt-3 z-30 group/btn">
                      <button
                        type="button"
                        onClick={() => setSlideIndex(1)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/95 dark:bg-[#121212] border border-zinc-700/90 flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        aria-label="Continue"
                      >
                        <ArrowRight className="w-4 h-4 stroke-2" />
                      </button>
                      {/* Tooltip 'Continue' có khung viền trắng chuẩn screenshot */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-0.5 bg-black text-white text-[11px] font-medium rounded border border-white/80 shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-40">
                        Continue
                      </div>
                    </div>
                  )}

                  {/* 4 Thẻ được bọc trong overflow-hidden để cắt gọn hoàn toàn item thứ 4 */}
                  <div className="overflow-hidden w-full">
                    <div
                      className="flex gap-3 transition-transform duration-300 ease-out select-none"
                      style={{
                        transform:
                          slideIndex === 0
                            ? 'translateX(0%)'
                            : 'translateX(calc(-1 * (100% + 12px) / 3))',
                      }}
                    >
                      {/* Card 1: Create thread */}
                      <div
                        data-card="true"
                        className="shrink-0 w-[calc((100%-24px)/3)] bg-zinc-100/90 dark:bg-[#1e1e1e] rounded-2xl p-5 flex flex-col justify-between items-center text-center border border-zinc-200/60 dark:border-zinc-800/40"
                      >
                        <div className="flex flex-col items-center w-full">
                          <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-[#121212] flex items-center justify-center text-black dark:text-white mb-3.5">
                            <SquarePen className="w-5 h-5 stroke-2" />
                          </div>
                          <h3 className="font-bold text-sm text-black dark:text-white mb-1.5">
                            Create thread
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 min-h-8">
                            Say what's on your mind or share a recent highlight.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateModalPlacement('center');
                            setIsCreateModalOpen(true);
                          }}
                          className="w-full h-9.5 bg-black dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center"
                        >
                          Create
                        </button>
                      </div>

                      {/* Card 2: Follow 10 profiles */}
                      <div
                        data-card="true"
                        className="shrink-0 w-[calc((100%-24px)/3)] bg-zinc-100/90 dark:bg-[#1e1e1e] rounded-2xl p-5 flex flex-col justify-between items-center text-center border border-zinc-200/60 dark:border-zinc-800/40"
                      >
                        <div className="flex flex-col items-center w-full">
                          <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-[#121212] flex items-center justify-center text-black dark:text-white mb-3.5">
                            <UserPlus className="w-5 h-5 stroke-2" />
                          </div>
                          <h3 className="font-bold text-sm text-black dark:text-white mb-1.5">
                            Follow 10 profiles
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 min-h-8">
                            Fill your feed with threads that interest you.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsFollowModalOpen(true)}
                          className="w-full h-9.5 bg-black dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center"
                        >
                          See profiles
                        </button>
                      </div>

                      {/* Card 3: Add bio */}
                      <div
                        data-card="true"
                        className="shrink-0 w-[calc((100%-24px)/3)] bg-zinc-100/90 dark:bg-[#1e1e1e] rounded-2xl p-5 flex flex-col justify-between items-center text-center border border-zinc-200/60 dark:border-zinc-800/40"
                      >
                        <div className="flex flex-col items-center w-full">
                          <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-[#121212] flex items-center justify-center text-black dark:text-white mb-3.5">
                            <Pencil className="w-5 h-5 stroke-2" />
                          </div>
                          <h3 className="font-bold text-sm text-black dark:text-white mb-1.5">
                            Add bio
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 min-h-8">
                            Introduce yourself and tell people what you’re into.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditName(name);
                            setEditBio(currentUser?.bio || '');
                            setIsEditModalOpen(true);
                          }}
                          className="w-full h-9.5 bg-black dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center"
                        >
                          Add
                        </button>
                      </div>

                      {/* Card 4: Add profile photo */}
                      <div
                        data-card="true"
                        className="shrink-0 w-[calc((100%-24px)/3)] bg-zinc-100/90 dark:bg-[#1e1e1e] rounded-2xl p-5 flex flex-col justify-between items-center text-center border border-zinc-200/60 dark:border-zinc-800/40"
                      >
                        <div className="flex flex-col items-center w-full">
                          <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-[#121212] flex items-center justify-center text-black dark:text-white mb-3.5">
                            <Check className="w-5 h-5 stroke-2" />
                          </div>
                          <h3 className="font-bold text-sm text-black dark:text-white mb-1.5">
                            Add profile photo
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 min-h-8">
                            Make it easier for people to recognize you.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled
                          className="w-full h-9.5 bg-zinc-200/40 dark:bg-[#161616] border border-zinc-300/60 dark:border-zinc-800 text-zinc-400 dark:text-[#666666] font-bold text-xs sm:text-sm rounded-xl cursor-default flex items-center justify-center"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách bài viết cá nhân của user */}
              {userPosts.length > 0 && (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {userPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'replies' && (
            <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-sm">
              Chưa có câu trả lời nào.
            </div>
          )}

          {activeTab === 'media' && (
            <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-sm">
              Chưa có hình ảnh hoặc video nào.
            </div>
          )}

          {activeTab === 'reposts' && (
            <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-sm">
              Chưa có bài đăng lại nào.
            </div>
          )}
        </section>
      </div>

      {/* 3. MODAL EDIT PROFILE CHUẨN THREADS WEB */}
      {isEditModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-125 bg-[#181818] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150">
            {/* Nội dung các hàng thông tin có thể scroll */}
            <div className="overflow-y-auto no-scrollbar scrollbar-none flex-1 divide-y divide-zinc-800/80">
              {/* Row 1: Name & Avatar */}
              <div className="flex items-center justify-between px-6 py-4.5">
                <div className="flex-1 pr-4">
                  <label className="text-sm font-bold text-white block">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-transparent text-sm text-zinc-300 outline-none pt-0.5 placeholder:text-zinc-600 font-normal"
                    placeholder="Tuan Anh"
                  />
                </div>
                <div className="relative shrink-0">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-13 h-13 rounded-full object-cover border border-zinc-700/60 shadow-md"
                  />
                </div>
              </div>

              {/* Row 2: Username */}
              <div className="px-6 py-4.5">
                <span className="text-sm font-bold text-white block">Username</span>
                <span className="text-sm text-zinc-400 block pt-0.5 font-normal">
                  {username}
                </span>
              </div>

              {/* Row 3: Bio */}
              <div className="px-6 py-4.5">
                <label className="text-sm font-bold text-white block">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="+ Write bio"
                  className="w-full bg-transparent text-sm text-zinc-300 placeholder:text-zinc-500 outline-none pt-0.5 resize-none font-normal"
                />
              </div>

              {/* Row 4: Interests */}
              <div
                onClick={() => {
                  const val = prompt('Thêm sở thích của bạn:', interests);
                  if (val !== null) setInterests(val.trim());
                }}
                className="flex items-center justify-between px-6 py-4.5 cursor-pointer hover:bg-zinc-800/30 transition-colors group"
              >
                <div>
                  <span className="text-sm font-bold text-white block">Interests</span>
                  <span className="text-sm text-zinc-500 block pt-0.5 font-normal">
                    {interests || 'Add interests'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
              </div>

              {/* Row 5: Links */}
              <div className="px-6 py-4.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white block">Links</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                </div>
                <input
                  type="text"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  placeholder="+ Add link"
                  className="w-full bg-transparent text-sm text-zinc-300 placeholder:text-zinc-500 outline-none pt-0.5 font-normal"
                />
              </div>

              {/* Row 6: Podcast */}
              <div
                onClick={() => {
                  const val = prompt('Link podcast của bạn:', podcast);
                  if (val !== null) setPodcast(val.trim());
                }}
                className="flex items-center justify-between px-6 py-4.5 cursor-pointer hover:bg-zinc-800/30 transition-colors group"
              >
                <div>
                  <span className="text-sm font-bold text-white block">Podcast</span>
                  <span className="text-sm text-zinc-500 block pt-0.5 font-normal">
                    {podcast || '+ Link to your podcast'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
              </div>

              {/* Row 7: Show Instagram badge */}
              <div className="flex items-center justify-between px-6 py-4.5">
                <span className="text-sm font-bold text-white">Show Instagram badge</span>
                <button
                  type="button"
                  onClick={() => setShowInstagramBadge((prev) => !prev)}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer border-2 flex items-center ${
                    showInstagramBadge
                      ? 'border-white bg-black'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                  aria-label="Toggle Instagram badge"
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      showInstagramBadge
                        ? 'bg-white translate-x-5.5'
                        : 'bg-zinc-600 translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Row 8: Show recent views */}
              <div className="flex items-start justify-between gap-4 px-6 py-4.5">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-white block">Show recent views</span>
                  <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                    This will be public on your profile when you get 1K+ recent views.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecentViews((prev) => !prev)}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer border-2 flex items-center shrink-0 mt-0.5 ${
                    showRecentViews
                      ? 'border-white bg-black'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                  aria-label="Toggle Recent views"
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      showRecentViews
                        ? 'bg-white translate-x-5.5'
                        : 'bg-zinc-600 translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Row 9: Profile privacy */}
              <div
                onClick={() => setIsPrivate((prev) => !prev)}
                className="flex items-start justify-between gap-4 px-6 py-4.5 cursor-pointer hover:bg-zinc-800/30 transition-colors group"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-white block">Profile privacy</span>
                  <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                    {isPrivate
                      ? 'Only approved followers can see your threads and replies.'
                      : 'If you switch to public, anyone can see your threads and replies.'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-zinc-400 shrink-0 mt-0.5 group-hover:text-zinc-200 transition-colors font-normal">
                  <span>{isPrivate ? 'Private' : 'Public'}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                </div>
              </div>
            </div>

            {/* Bottom Done button */}
            <div className="p-6 pt-5">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full py-3.5 bg-white text-black font-bold text-[15px] rounded-2xl hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-xl flex items-center justify-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL FOLLOW PROFILES (Gợi ý theo dõi) */}
      {isFollowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold text-lg text-black dark:text-white">
                Follow profiles
              </h2>
              <button
                type="button"
                onClick={() => setIsFollowModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Gợi ý các tài khoản nổi bật phù hợp với phong cách của bạn:
            </p>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-80 overflow-y-auto no-scrollbar scrollbar-none">
              {suggestedProfiles.map((profile) => {
                const isFollowing = followedIds.includes(profile.id);
                return (
                  <div
                    key={profile.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-black dark:text-white truncate block">
                          {profile.name}
                        </span>
                        <span className="text-xs text-zinc-500 truncate block">
                          @{profile.username}
                        </span>
                        <span className="text-[11px] text-zinc-400 truncate block">
                          {profile.bio}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFollow(profile.id, profile.username)}
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer ${
                        isFollowing
                          ? 'border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-red-500 hover:border-red-500'
                          : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsFollowModalOpen(false)}
                className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL TẠO BÀI VIẾT (CreatePostModal) */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePost={handleCreatePost}
        placement={createModalPlacement}
        currentUser={currentUser}
      />

      {/* 5. NÚT NỔI [+] Ở GÓC PHẢI DƯỚI MÀN HÌNH */}
      <button
        type="button"
        onClick={() => {
          setCreateModalPlacement('bottom-right');
          setIsCreateModalOpen(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform text-black dark:text-white cursor-pointer z-40"
        title="Tạo bài viết mới"
        aria-label="Tạo bài viết mới"
      >
        <Plus className="w-6 h-6 stroke-2" />
      </button>

      {/* Toast thông báo nhanh */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold shadow-lg z-50 animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}

      {/* 6. MODAL XÁC NHẬN ĐĂNG XUẤT */}
      {isLogoutModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLogoutModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-black dark:text-white">
                Đăng xuất khỏi @{username}?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bạn có thể đăng nhập lại bất kỳ lúc nào để tiếp tục sử dụng.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-sm text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(logout());
                  setIsLogoutModalOpen(false);
                  navigate('/login', { replace: true });
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-md"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
