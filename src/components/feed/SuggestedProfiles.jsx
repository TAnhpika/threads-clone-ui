import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import defaultAvatar from '@/assets/images/default-avatar.svg';

const INITIAL_SUGGESTIONS = [
  {
    id: 'sug-1',
    name: '33',
    username: 'ziiggyzagg',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isBrand: false,
  },
  {
    id: 'sug-2',
    name: 'CHRISTIE',
    username: '_mindbodyalign...',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    isBrand: false,
  },
  {
    id: 'sug-3',
    name: 'Hommy Greek Y...',
    username: 'hommygreek.yog...',
    avatar: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&auto=format&fit=crop&q=80',
    isBrand: true,
    brandText: 'Hommy',
  },
  {
    id: 'sug-4',
    name: 'Musonic',
    username: 'musonic2',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80',
    isBrand: false,
  },
  {
    id: 'sug-5',
    name: 'Trang Tròn Tròn',
    username: 'trang.ootd',
    avatar: defaultAvatar,
    isBrand: false,
  },
  {
    id: 'sug-6',
    name: 'Sài Gòn Ơi',
    username: 'saigondiary.vn',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    isBrand: false,
  },
  {
    id: 'sug-7',
    name: 'Phở & Cà Phê',
    username: 'vietnam.foodmap',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    isBrand: false,
  },
];

export default function SuggestedProfiles({ className = '' }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [profiles, setProfiles] = useState(INITIAL_SUGGESTIONS);
  const [followingMap, setFollowingMap] = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);

  const containerRef = useRef(null);

  // Cập nhật vị trí thanh cuộn ngang bên dưới
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    const progress = (scrollLeft / maxScroll) * 100;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollByAmount = (offset) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleDismiss = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFollow = (id) => {
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-auth-prompt', { detail: { type: 'say_more' } })
      );
      return;
    }

    setFollowingMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (profiles.length === 0) return null;

  return (
    <div
      className={`py-4 px-4 sm:px-6 w-full select-none animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
    >
      {/* 1. Header: 'Suggested for you' */}
      <h3 className="text-sm sm:text-[15px] font-bold text-black dark:text-white mb-3 tracking-tight">
        Suggested for you
      </h3>

      {/* 2. Horizontal Scrollable Cards List */}
      <div
        ref={containerRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {profiles.map((profile) => {
          const isFollowing = !!followingMap[profile.id];

          return (
            <div
              key={profile.id}
              className="w-[145px] sm:w-[155px] shrink-0 bg-zinc-50 dark:bg-[#181818] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-3.5 flex flex-col items-center justify-between relative shadow-xs group transition-transform hover:-translate-y-0.5"
            >
              {/* Nút đóng [X] ở góc trên bên phải */}
              <button
                type="button"
                onClick={() => handleDismiss(profile.id)}
                className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-black dark:hover:text-white p-0.5 rounded-full transition-colors cursor-pointer"
                title="Dismiss"
                aria-label="Dismiss suggestion"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {/* Avatar to tròn ở giữa */}
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden mt-1 mb-2.5 shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                {profile.isBrand && profile.brandText ? (
                  <div className="w-full h-full bg-[#f4f7fa] dark:bg-[#1e2530] text-[#1b4372] dark:text-[#7bb0e8] flex items-center justify-center font-serif font-black text-sm text-center px-1">
                    {profile.brandText}
                  </div>
                ) : (
                  <img
                    src={profile.avatar || defaultAvatar}
                    alt={profile.name}
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              {/* Tên hiển thị (Bold) */}
              <span className="font-bold text-sm text-black dark:text-white truncate max-w-full text-center px-1">
                {profile.name}
              </span>

              {/* Username (Muted) */}
              <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-full text-center mb-3 px-1">
                {profile.username}
              </span>

              {/* Nút Follow */}
              <button
                type="button"
                onClick={() => handleFollow(profile.id)}
                className={`w-full py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs text-center ${
                  isFollowing
                    ? 'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-transparent hover:border-red-500/50 hover:text-red-500'
                    : 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Thanh điều hướng cuộn ngang (Horizontal Scrollbar & Arrows chuẩn Threads) */}
      <div className="mt-2.5 flex items-center gap-1.5 bg-zinc-100 dark:bg-[#111111] border border-zinc-200/60 dark:border-zinc-800/60 rounded-md py-0.5 px-1 w-full max-w-full">
        {/* Nút mũi tên trái */}
        <button
          type="button"
          onClick={() => scrollByAmount(-220)}
          className="text-zinc-400 hover:text-black dark:hover:text-white p-0.5 cursor-pointer rounded transition-colors"
          title="Scroll left"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Thanh track & thumb hiển thị tiến trình cuộn */}
        <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800/80 rounded-full relative overflow-hidden">
          <div
            className="h-full bg-zinc-400 dark:bg-zinc-600 rounded-full transition-all duration-150"
            style={{
              width: '35%',
              transform: `translateX(${scrollProgress * 1.85}%)`,
            }}
          />
        </div>

        {/* Nút mũi tên phải */}
        <button
          type="button"
          onClick={() => scrollByAmount(220)}
          className="text-zinc-400 hover:text-black dark:hover:text-white p-0.5 cursor-pointer rounded transition-colors"
          title="Scroll right"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
