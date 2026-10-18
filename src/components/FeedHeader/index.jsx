import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

export default function FeedHeader({
  title = 'For you',
  isLoggedIn = false,
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
    <header className="py-2.5 px-1 mb-2 select-none">
      <div className="flex items-center justify-between relative">
        {/* Tiêu đề bảng tin: 'For you' hoặc 'Following' theo chuẩn Threads.com */}
        <h1 className="text-base sm:text-[17px] font-bold text-black dark:text-white tracking-tight">
          {title}
        </h1>

        {/* Nút tròn (...) tùy chọn bảng tin */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors cursor-pointer ${
              isMenuOpen
                ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
                : 'text-zinc-500 hover:text-black dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Tùy chọn bảng tin"
            aria-label="Tùy chọn bảng tin"
            aria-expanded={isMenuOpen}
          >
            <MoreHorizontal className="w-4.5 h-4.5 stroke-[2]" />
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
      </div>
    </header>
  );
}
