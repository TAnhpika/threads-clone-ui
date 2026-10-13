import { useState, useRef, useEffect } from 'react';
import {
  Search,
  User,
  ListFilter,
  ChevronDown,
  MoreHorizontal,
  Info,
  Plus,
  Check,
} from 'lucide-react';
import CreatePostModal from '@/components/post/CreatePostModal';

const timeRanges = [
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
  'All time',
];

const postSortOptions = [
  'Latest posts',
  'Top views',
  'Top interactions',
];

export default function InsightsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 30 days');
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [selectedPostSort, setSelectedPostSort] = useState('Latest posts');
  const [isPostSortOpen, setIsPostSortOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Floating create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const timeRangeRef = useRef(null);
  const postSortRef = useRef(null);
  const optionsRef = useRef(null);

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (timeRangeRef.current && !timeRangeRef.current.contains(event.target)) {
        setIsTimeRangeOpen(false);
      }
      if (postSortRef.current && !postSortRef.current.contains(event.target)) {
        setIsPostSortOpen(false);
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

  return (
    <div className="h-full w-full flex bg-white dark:bg-black text-black dark:text-white overflow-hidden select-none">
      {/* 1. CỘT TRÁI: Danh sách Insights & Bộ lọc Threads */}
      <aside className="w-full md:w-88 md:min-w-88 lg:w-96 lg:min-w-96 shrink-0 h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-black p-5 space-y-4 overflow-y-auto scrollbar-none no-scrollbar">
        {/* Tiêu đề Insights */}
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Insights
        </h1>

        {/* Thanh tìm kiếm Search */}
        <div className="flex items-center gap-2.5 bg-zinc-100 dark:bg-[#1a1a1a] border border-zinc-200/80 dark:border-zinc-800 rounded-full px-3.5 py-2 transition-colors focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
          <Search className="w-4 h-4 text-zinc-500 shrink-0 stroke-2" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-black dark:text-white placeholder-zinc-500 outline-none"
          />
        </div>

        {/* Mục Overview được chọn (Khối bo góc nổi bật) */}
        <div className="bg-zinc-100 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0">
            <User className="w-5 h-5 stroke-2" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-black dark:text-white">
              Overview
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
              Profile, viewer, and follower insights
            </p>
          </div>
        </div>

        {/* Dải phân loại: [≡ Threads] & [Latest posts ⌵] */}
        <div className="flex items-center justify-between gap-2 pt-2">
          {/* Nút Threads */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-[#1a1a1a] border border-zinc-200/80 dark:border-zinc-800 text-black dark:text-white cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <ListFilter className="w-3.5 h-3.5 stroke-2" />
            <span>Threads</span>
          </button>

          {/* Dropdown sắp xếp bài viết */}
          <div className="relative" ref={postSortRef}>
            <button
              type="button"
              onClick={() => setIsPostSortOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-[#1a1a1a] border border-zinc-200/80 dark:border-zinc-800 text-black dark:text-white cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>{selectedPostSort}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 stroke-2" />
            </button>

            {isPostSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {postSortOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedPostSort(opt);
                      setIsPostSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                      selectedPostSort === opt
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedPostSort === opt && <Check className="w-3.5 h-3.5 stroke-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trạng thái trống của Threads */}
        <div className="pt-10 pb-6 text-center text-xs text-zinc-500 font-normal">
          No threads yet
        </div>
      </aside>

      {/* 2. CỘT PHẢI: Bảng điều khiển Số liệu Insights (Overview Dashboard) */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-none no-scrollbar bg-white dark:bg-black relative">
        {/* Top Header: Overview [Last 30 days ⌵] & Options (...) */}
        <header className="flex items-center justify-between pb-2 select-none">
          {/* Tiêu đề & Chọn khoảng thời gian */}
          <div className="flex items-center gap-2 relative" ref={timeRangeRef}>
            <span className="font-bold text-base text-black dark:text-white">
              Overview
            </span>
            <button
              type="button"
              onClick={() => setIsTimeRangeOpen((prev) => !prev)}
              className="flex items-center gap-1 text-sm font-normal text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>{selectedTimeRange}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400 stroke-2" />
            </button>

            {/* Menu Dropdown Khoảng thời gian */}
            {isTimeRangeOpen && (
              <div className="absolute left-18 top-full mt-2 w-44 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedTimeRange(range);
                      setIsTimeRangeOpen(false);
                      showToast(`Đã lọc theo: ${range}`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                      selectedTimeRange === range
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <span>{range}</span>
                    {selectedTimeRange === range && <Check className="w-3.5 h-3.5 stroke-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nút tuỳ chọn (...) hình tròn viền mỏng */}
          <div className="relative" ref={optionsRef}>
            <button
              type="button"
              onClick={() => setIsOptionsOpen((prev) => !prev)}
              className="w-7 h-7 rounded-full border border-zinc-300 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Tuỳ chọn"
            >
              <MoreHorizontal className="w-4 h-4 stroke-2" />
            </button>

            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    showToast('Đã xuất báo cáo số liệu');
                  }}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Xuất dữ liệu số liệu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    showToast('Cài đặt thông tin chi tiết');
                  }}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Giới thiệu về Insights
                </button>
              </div>
            )}
          </div>
        </header>

        {/* THẺ 1: SUMMARY CARD */}
        <section className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-black dark:text-white">
              Summary
            </h2>
            <button
              type="button"
              onClick={() => showToast('Tổng kết các chỉ số trong 30 ngày')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
              title="Thông tin chi tiết"
            >
              <Info className="w-4.5 h-4.5 stroke-2" />
            </button>
          </div>

          {/* Lưới 4 ô chỉ số: Views | Viewers | Net followers | Interactions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
            {/* Box 1: Views */}
            <div className="bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Views
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-bold text-black dark:text-white block">
                  0
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal mt-0.5 block">
                  0.0%
                </span>
              </div>
            </div>

            {/* Box 2: Viewers */}
            <div className="bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Viewers
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-bold text-black dark:text-white block">
                  0
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal mt-0.5 block">
                  0.0%
                </span>
              </div>
            </div>

            {/* Box 3: Net followers */}
            <div className="bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Net followers
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-bold text-black dark:text-white block">
                  +0
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal mt-0.5 block">
                  0.0%
                </span>
              </div>
            </div>

            {/* Box 4: Interactions */}
            <div className="bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Interactions
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-bold text-black dark:text-white block">
                  0
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal mt-0.5 block">
                  0.0%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* THẺ 2: VIEWERS CARD */}
        <section className="w-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-black dark:text-white">
              Viewers
            </h2>
            <button
              type="button"
              onClick={() => showToast('Số người xem trang cá nhân')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
              title="Thông tin chi tiết"
            >
              <Info className="w-4.5 h-4.5 stroke-2" />
            </button>
          </div>

          {/* Chỉ số Viewers lớn */}
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-black dark:text-white block">
              0
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal mt-1 block">
              0.0% since Sep 13
            </span>
          </div>

          {/* Phân loại người xem: Viewer types */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 mb-3">
              Viewer types
            </h3>

            {/* 2 Ô phân loại: Followers & Non-followers */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Followers */}
              <div className="bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Followers
                </span>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-bold text-black dark:text-white block">
                    0
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal mt-0.5 block">
                    0.0%
                  </span>
                </div>
              </div>

              {/* Non-followers */}
              <div className="bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Non-followers
                </span>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-bold text-black dark:text-white block">
                    0
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal mt-0.5 block">
                    0.0%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nút nổi vuông bo góc dấu cộng [+] ở góc dưới bên phải */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-6 right-6 sm:right-8 w-14 h-14 rounded-2xl bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
          title="Tạo Thread mới"
          aria-label="Tạo Thread mới"
        >
          <Plus className="w-7 h-7 stroke-2" />
        </button>

        {/* Modal tạo bài viết */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmitPost={() => showToast('Đã đăng bài viết mới thành công ✨')}
          placement="bottom-right"
        />

        {/* Toast thông báo */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs sm:text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            {toastMessage}
          </div>
        )}
      </main>
    </div>
  );
}
