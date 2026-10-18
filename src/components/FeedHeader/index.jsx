import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

export default function FeedHeader({
  title,
  isLoggedIn = false,
  activeTab = 'for_you',
  onTabChange,
  onCreateFeed,
}) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Đóng popover khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleCreateFeedClick = () => {
    setIsMenuOpen(false);
    if (onCreateFeed) {
      onCreateFeed();
    }
  };

  return (
    <header className="py-2 px-1 mb-2 select-none">
      <div className="flex items-center justify-between relative">
        {isLoggedIn ? (
          <div className="flex items-center gap-5 text-sm sm:text-base font-bold tracking-tight">
            <button
              type="button"
              onClick={() => onTabChange?.('for_you')}
              className={`transition-colors cursor-pointer relative py-1 ${
                activeTab === 'for_you'
                  ? 'text-black dark:text-white'
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <span>{t('home.forYou', 'Dành cho bạn')}</span>
              {activeTab === 'for_you' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full animate-in fade-in duration-150" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange?.('following')}
              className={`transition-colors cursor-pointer relative py-1 ${
                activeTab === 'following'
                  ? 'text-black dark:text-white'
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <span>{t('home.following', 'Đang theo dõi')}</span>
              {activeTab === 'following' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full animate-in fade-in duration-150" />
              )}
            </button>
          </div>
        ) : (
          <h1 className="text-base font-bold text-black dark:text-white tracking-tight">
            {title || t('home.feedTitle', 'Trang chủ')}
          </h1>
        )}

        {isLoggedIn && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`w-7 h-7 rounded-full border border-zinc-300 dark:border-zinc-700/80 flex items-center justify-center transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
                  : 'text-zinc-500 hover:text-black dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Tùy chọn bảng tin"
              aria-label="Tùy chọn bảng tin"
              aria-expanded={isMenuOpen}
            >
              <MoreHorizontal className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* Popover: 'Create new feed (+)' */}
            {isMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 dark:bg-[#242424] text-white border border-zinc-700/80 dark:border-zinc-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
                role="menu"
              >
                <button
                  type="button"
                  onClick={handleCreateFeedClick}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-semibold text-white hover:bg-zinc-800 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer group"
                >
                  <span>{t('feed.createNewFeed', 'Create new feed')}</span>
                  <PlusCircle className="w-5 h-5 text-white stroke-2 group-hover:scale-105 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
