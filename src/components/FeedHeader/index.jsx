import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

export default function FeedHeader({ title, isLoggedIn = false, onCreateFeed }) {
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
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3.5 transition-colors">
      <div className="flex items-center justify-between relative">
        {isLoggedIn ? (
          <div className="flex items-center gap-1.5 font-bold text-base text-black dark:text-white tracking-tight">
            <span>{t('home.forYou', 'For you')}</span>
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
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Tùy chọn bảng tin"
              aria-label="Tùy chọn bảng tin"
              aria-expanded={isMenuOpen}
            >
              <MoreHorizontal className="w-4 h-4" />
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

