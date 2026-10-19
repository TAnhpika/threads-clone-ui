import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';
import {
  Link2,
  Bookmark,
  EyeOff,
  ChevronRight,
  UserX,
  Ban,
  MessageCircleWarning,
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';

// Custom Restrict / Unrestrict Icon chuẩn Threads gốc Meta
function RestrictIcon({ isRestricted = false, className = 'w-5 h-5' }) {
  return (
    <svg
      role="img"
      viewBox="0 0 20 20"
      className={className}
    >
      {/* Chiếc khiên: fill='none' khi Restrict, fill='currentColor' khi Unrestrict */}
      <path
        d="M4.73729 10L1 11.9824V13.438C1 15.8791 2.47716 18.0775 4.73729 19C6.99739 18.0775 8.47458 15.8791 8.47458 13.438V11.9824L4.73729 10Z"
        fill={isRestricted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.5"
      />
      {/* Đầu người dùng */}
      <circle
        cx="10"
        cy="4.5"
        fill="none"
        r="3.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Thân/vai người dùng */}
      <path
        d="M11 12C11 12.4142 11.3358 12.75 11.75 12.75H12.75C13.4705 12.75 13.7581 12.7516 13.9895 12.7821C15.6722 13.0036 16.9964 14.3278 17.2179 16.0105C17.2484 16.2419 17.25 16.5295 17.25 17.25C17.25 17.5061 17.2484 17.5614 17.2436 17.5979C17.1993 17.9345 16.9344 18.1993 16.5979 18.2436C16.5614 18.2484 16.506 18.25 16.25 18.25H10.75C10.3358 18.25 10 18.5858 10 19V19C10 19.4142 10.3358 19.75 10.75 19.75H16.25L16.2919 19.75C16.4823 19.7501 16.6459 19.7502 16.7937 19.7308C17.8033 19.5978 18.5978 18.8033 18.7308 17.7937C18.7502 17.646 18.7501 17.4823 18.75 17.292V17.292L18.75 17.25L18.75 17.1844C18.7501 16.5504 18.7501 16.1566 18.7051 15.8147C18.3949 13.4589 16.5411 11.6051 14.1853 11.2949C13.8435 11.2499 13.4497 11.25 12.8156 11.25L12.75 11.25H11.75C11.3358 11.25 11 11.5858 11 12V12Z"
        fill="currentColor"
      />
    </svg>
  );
}

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

export default function PostMenu({
  isOpen,
  onClose,
  postUrl = window.location.href,
  onAction,
  isSaved = false,
  isMuted = false,
  isRestricted = false,
}) {
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

  const handleCopyLink = (e) => {
    e?.stopPropagation?.();
    copy(postUrl);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(postUrl).catch(() => {});
    }
    if (onAction) onAction('copy_link');
    onClose();
  };

  const handleItemClick = (e, actionName) => {
    e?.stopPropagation?.();
    if (onAction) onAction(actionName);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute right-0 top-9 w-64 p-1.5 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[60] animate-in fade-in zoom-in-95 duration-150 select-none text-black dark:text-white"
      role="menu"
      aria-label="Tùy chọn bài viết"
    >
      {view === 'add_to_feed' ? (
        /* Submenu: Add to feed */
        <div className="space-y-1 animate-in fade-in slide-in-from-right-2 duration-150">
          {/* Header với nút quay lại */}
          <div className="flex items-center gap-2.5 px-1.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setView('main');
              }}
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
              onClick={(e) => handleItemClick(e, 'create_feed')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
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
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.copyLink', 'Copy link')}</span>
              <Link2 className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>

            <button
              onClick={(e) => handleItemClick(e, 'embed')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.embed', 'Get embed code')}</span>
              <EmbedCodeIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>
          </div>

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

          {/* Nhóm 2: Tương tác cá nhân */}
          <div className="space-y-0.5">
            <button
              onClick={(e) => handleItemClick(e, isSaved ? 'unsave' : 'save')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{isSaved ? t('postMenu.unsave', 'Unsave') : t('postMenu.save', 'Save')}</span>
              <Bookmark
                className={`w-5 h-5 stroke-[2.2] ${
                  isSaved
                    ? 'fill-black dark:fill-white text-black dark:text-white'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              />
            </button>

            <button
              onClick={(e) => handleItemClick(e, 'not_interested')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.notInterested', 'Not interested')}</span>
              <EyeOff className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>
          </div>

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

          {/* Nhóm 3: Kiểm soát & Quan hệ */}
          <div className="space-y-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setView('add_to_feed');
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.addToFeed', 'Add to feed')}</span>
              <ChevronRight className="w-5 h-5 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />
            </button>

            <button
              onClick={(e) => handleItemClick(e, isMuted ? 'unmute' : 'mute')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{isMuted ? t('postMenu.unmute', 'Unmute') : t('postMenu.mute', 'Mute')}</span>
              <UserX className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>

            <button
              onClick={(e) => handleItemClick(e, isRestricted ? 'unrestrict' : 'restrict')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span>{isRestricted ? t('postMenu.unrestrict', 'Unrestrict') : t('postMenu.restrict', 'Restrict')}</span>
              <RestrictIcon isRestricted={isRestricted} className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.2]" />
            </button>

            {/* Các mục cảnh báo màu đỏ */}
            <button
              onClick={(e) => handleItemClick(e, 'block')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <span>{t('postMenu.block', 'Block')}</span>
              <Ban className="w-5 h-5 text-red-500 stroke-[2.2]" />
            </button>

            <button
              onClick={(e) => handleItemClick(e, 'report')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
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
