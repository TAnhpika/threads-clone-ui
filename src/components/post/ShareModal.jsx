import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Link2, Image, Globe } from 'lucide-react';
import userAvatar from '@/assets/images/ava.png';

// Icon Instagram Story với dải gradient đặc trưng
function InstagramStoryIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="url(#ig-story-grad)"
        strokeWidth="2"
        strokeDasharray="3 2"
      />
      <path
        d="M12 8v8M8 12h8"
        stroke="url(#ig-story-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="ig-story-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const defaultProfiles = [
  {
    id: 'user-1',
    username: '_lamih',
    name: 'Linh Nguyen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-2',
    username: 'alexander.sartorial',
    name: 'Alexander Vance',
    avatar: userAvatar,
  },
  {
    id: 'user-3',
    username: 'the.gentleman.archive',
    name: 'The Gentleman Archive',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
];

export default function ShareModal({
  isOpen,
  onClose,
  postUrl = window.location.href,
  onActionFeedback,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const modalContentRef = useRef(null);
  const { t } = useTranslation();

  // Đóng modal khi bấm phím Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Ngăn cuộn trang nền khi modal đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProfiles = defaultProfiles.filter(
    (profile) =>
      profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAction = (type) => {
    if (type === 'copy_link') {
      if (navigator?.clipboard) {
        navigator.clipboard.writeText(postUrl);
      }
      if (onActionFeedback) onActionFeedback('Đã sao chép liên kết vào bộ nhớ tạm');
    } else if (type === 'instagram_story') {
      if (onActionFeedback) onActionFeedback('Đang chuyển hướng chia sẻ lên Instagram Story...');
    } else if (type === 'copy_image') {
      if (onActionFeedback) onActionFeedback('Đã sao chép bài viết dưới dạng hình ảnh');
    } else if (type === 'embed_code') {
      if (onActionFeedback) onActionFeedback('Đã sao chép mã nhúng bài viết');
    }
    onClose();
  };

  const handleSendToUser = (profile) => {
    setSelectedUser(profile.id);
    if (onActionFeedback) {
      onActionFeedback(`Đã gửi bài viết đến @${profile.username}`);
    }
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        ref={modalContentRef}
        className="w-full max-w-md bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 text-black dark:text-white"
      >
        {/* Header Modal */}
        <div className="relative px-4 py-3.5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80">
          <button
            onClick={onClose}
            className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 hover:opacity-75 transition-opacity cursor-pointer"
          >
            {t('shareModal.cancel', 'Cancel')}
          </button>
          <h2
            id="share-modal-title"
            className="text-base font-bold text-center absolute left-1/2 -translate-x-1/2"
          >
            {t('shareModal.sendTo', 'Send to')}
          </h2>
          <div className="w-12" aria-hidden="true" />
        </div>

        {/* Thân Modal */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Ô tìm kiếm Profiles */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('shareModal.searchPlaceholder', 'Search for Threads profiles')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800/80 border border-transparent dark:border-zinc-700/50 rounded-2xl text-sm placeholder-zinc-400 dark:placeholder-zinc-500 text-black dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* Banner thông báo */}
          {showBanner && (
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-100/90 dark:bg-zinc-800/60 rounded-xl text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                {t(
                  'shareModal.bannerText',
                  'You can now message people directly on Threads.',
                )}
              </span>
              <button
                onClick={() => setShowBanner(false)}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Danh sách người nhận (gợi ý) */}
          <div className="py-2 flex items-center justify-center gap-6 flex-wrap min-h-36">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSendToUser(profile)}
                  className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <div className="relative">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className={`w-20 h-20 rounded-full object-cover border-2 transition-transform group-hover:scale-105 ${
                        selectedUser === profile.id
                          ? 'border-green-500 scale-105'
                          : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {profile.username}
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 leading-tight">
                      {profile.name}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-xs text-zinc-400 py-6">
                {t('shareModal.noProfiles', 'Không tìm thấy hồ sơ nào')}
              </div>
            )}
          </div>
        </div>

        {/* Chân Modal: 4 tùy chọn chia sẻ nhanh */}
        <div className="mt-auto p-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* 1. Instagram Story */}
            <button
              onClick={() => handleAction('instagram_story')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform group-hover:scale-105">
                <InstagramStoryIcon className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 leading-tight">
                {t('shareModal.instagramStory', 'Instagram story')}
              </span>
            </button>

            {/* 2. Copy Link */}
            <button
              onClick={() => handleAction('copy_link')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform group-hover:scale-105">
                <Link2 className="w-5 h-5 text-zinc-800 dark:text-zinc-200 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 leading-tight">
                {t('shareModal.copyLink', 'Copy link')}
              </span>
            </button>

            {/* 3. Copy as Image */}
            <button
              onClick={() => handleAction('copy_image')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform group-hover:scale-105">
                <Image className="w-5 h-5 text-zinc-800 dark:text-zinc-200 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 leading-tight">
                {t('shareModal.copyAsImage', 'Copy as image')}
              </span>
            </button>

            {/* 4. Embed Code */}
            <button
              onClick={() => handleAction('embed_code')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform group-hover:scale-105">
                <Globe className="w-5 h-5 text-zinc-800 dark:text-zinc-200 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 leading-tight">
                {t('shareModal.embedCode', 'Embed code')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
