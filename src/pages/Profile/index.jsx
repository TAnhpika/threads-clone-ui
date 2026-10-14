import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MoreHorizontal,
  Plus,
  SquarePen,
  UserPlus,
  Pencil,
  X,
  Lock,
  Globe,
  Share2,
  Copy,
} from 'lucide-react';
import { selectCurrentUser, updateCurrentUser } from '@/features/auth/authSlice';
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPlacement, setCreateModalPlacement] = useState('center');
  const [toastMessage, setToastMessage] = useState(null);

  // Danh sách bài viết của user trên trang profile
  const [userPosts, setUserPosts] = useState([]);

  // Form state cho Edit Profile
  const [editName, setEditName] = useState(currentUser?.name || 'Tuan Anh');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editLink, setEditLink] = useState(currentUser?.link || '');
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);

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
                <button
                  type="button"
                  onClick={() => window.open('https://instagram.com', '_blank')}
                  className="mt-3 text-black dark:text-white hover:opacity-75 transition-opacity cursor-pointer p-1"
                  title="Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </button>
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

              {/* Khối 'Finish your profile' (3 left) */}
              <div className="border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <span className="font-bold text-sm text-black dark:text-white">
                    Finish your profile
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">
                    3 left
                  </span>
                </div>

                {/* 3 Thẻ hành động thiết lập hồ sơ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 pb-6">
                  {/* Card 1: Create thread */}
                  <div className="bg-zinc-100/80 dark:bg-[#1a1a1a] rounded-2xl p-4 flex flex-col justify-between border border-zinc-200/50 dark:border-zinc-800/60">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-zinc-200/90 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white mb-3">
                        <SquarePen className="w-5 h-5 stroke-2" />
                      </div>
                      <h3 className="font-bold text-sm text-black dark:text-white mb-1">
                        Create thread
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Say what's on your mind or share a recent highlight.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateModalPlacement('center');
                        setIsCreateModalOpen(true);
                      }}
                      className="mt-4 w-full py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-center"
                    >
                      Create
                    </button>
                  </div>

                  {/* Card 2: Follow 10 profiles */}
                  <div className="bg-zinc-100/80 dark:bg-[#1a1a1a] rounded-2xl p-4 flex flex-col justify-between border border-zinc-200/50 dark:border-zinc-800/60">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-zinc-200/90 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white mb-3">
                        <UserPlus className="w-5 h-5 stroke-2" />
                      </div>
                      <h3 className="font-bold text-sm text-black dark:text-white mb-1">
                        Follow 10 profiles
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Fill your feed with threads that interest you.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/search')}
                      className="mt-4 w-full py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-center"
                    >
                      See profiles
                    </button>
                  </div>

                  {/* Card 3: Add bio */}
                  <div className="bg-zinc-100/80 dark:bg-[#1a1a1a] rounded-2xl p-4 flex flex-col justify-between border border-zinc-200/50 dark:border-zinc-800/60">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-zinc-200/90 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white mb-3">
                        <Pencil className="w-5 h-5 stroke-2" />
                      </div>
                      <h3 className="font-bold text-sm text-black dark:text-white mb-1">
                        Add bio
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Introduce yourself and tell people what you're into.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditName(name);
                        setEditBio(currentUser?.bio || '');
                        setIsEditModalOpen(true);
                      }}
                      className="mt-4 w-full py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-center"
                    >
                      Add
                    </button>
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

      {/* 3. MODAL EDIT PROFILE CHUẨN THREADS */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold text-lg text-black dark:text-white">
                Edit profile
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  placeholder="Your display name"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white text-sm outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                  placeholder="+ Write bio"
                />
              </div>

              {/* Link */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Link
                </label>
                <input
                  type="text"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  placeholder="+ Add link"
                />
              </div>

              {/* Private profile switch */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-semibold text-sm text-black dark:text-white block">
                    Private profile
                  </span>
                  <span className="text-xs text-zinc-500">
                    If you turn this on, only approved followers can see your posts.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    isPrivate ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`bg-white dark:bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isPrivate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Done button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL TẠO BÀI VIẾT (CreatePostModal) */}
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
    </div>
  );
}
