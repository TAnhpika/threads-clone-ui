import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link2,
  Bookmark,
  EyeOff,
  ChevronRight,
  UserX,
  ShieldAlert,
  Ban,
  MessageCircleWarning,
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';

// Custom Embed Icon chuẩn Threads {...}
function EmbedCodeIcon({ className = 'w-5 h-5' }) {
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
      <path d="M7 4a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2" />
      <path d="M17 4a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2" />
      <circle cx="10" cy="12" r="0.75" fill="currentColor" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
      <circle cx="14" cy="12" r="0.75" fill="currentColor" />
    </svg>
  );
}

export default function PostMenu({ isOpen, onClose, postUrl = window.location.href, onAction }) {
  const [view, setView] = useState('main'); // 'main' | 'add_to_feed'
  const menuRef = useRef(null);
  const { t } = useTranslation();

  // Reset view về 'main' khi đóng
  useEffect(() => {
    if (!isOpen) {
      setView('main');
    }
  }, [isOpen]);

  // Đóng menu khi click ra ngoài hoặc bấm phím Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (view !== 'main') {
          setView('main');
        } else {
          onClose();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, view]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(postUrl);
    }
    if (onAction) onAction('copy_link');
    onClose();
  };

  const handleItemClick = (actionName) => {
    if (onAction) onAction(actionName);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-9 w-64 p-1.5 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none text-black dark:text-white"
      role="menu"
      aria-label="Tùy chọn bài viết"
    >
      {view === 'add_to_feed' ? (
        /* Submenu: Add to feed */
        <div className="space-y-1 animate-in fade-in slide-in-from-right-2 duration-150">
          {/* Header với nút quay lại */}
          <div className="flex items-center gap-2.5 px-1.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
            <button
              onClick={() => setView('main')}
              className="p-1 rounded-full text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Quay lại"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">
              {t('postMenu.addToFeed', 'Add to feed')}
            </span>
          </div>

          {/* Danh sách hành động */}
          <div className="pt-0.5">
            <button
              onClick={() => handleItemClick('create_feed')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
            >
              <span>{t('postMenu.createNewFeed', 'Create new feed')}</span>
              <PlusCircle className="w-5 h-5 text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition-transform stroke-2" />
            </button>
          </div>
        </div>
      ) : (
        /* Menu chính */
        <>
          {/* Nhóm 1: Chia sẻ & Mã nhúng */}
          <div className="space-y-0.5">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.copyLink', 'Copy link')}</span>
              <Link2 className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>

            <button
              onClick={() => handleItemClick('embed')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.embed', 'Get embed code')}</span>
              <EmbedCodeIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>
          </div>

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

          {/* Nhóm 2: Tương tác cá nhân */}
          <div className="space-y-0.5">
            <button
              onClick={() => handleItemClick('save')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.save', 'Save')}</span>
              <Bookmark className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>

            <button
              onClick={() => handleItemClick('not_interested')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.notInterested', 'Not interested')}</span>
              <EyeOff className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>
          </div>

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

          {/* Nhóm 3: Kiểm soát & Quan hệ */}
          <div className="space-y-0.5">
            <button
              onClick={() => setView('add_to_feed')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.addToFeed', 'Add to feed')}</span>
              <ChevronRight className="w-5 h-5 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />
            </button>

            <button
              onClick={() => handleItemClick('mute')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.mute', 'Mute')}</span>
              <UserX className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>

            <button
              onClick={() => handleItemClick('restrict')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.restrict', 'Restrict')}</span>
              <ShieldAlert className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>

            {/* Các mục cảnh báo màu đỏ */}
            <button
              onClick={() => handleItemClick('block')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.block', 'Block')}</span>
              <Ban className="w-5 h-5 text-red-500 stroke-[2.2]" />
            </button>

            <button
              onClick={() => handleItemClick('report')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.report', 'Report')}</span>
              <MessageCircleWarning className="w-5 h-5 text-red-500 stroke-[2.2]" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
