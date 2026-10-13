import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Repeat2 } from 'lucide-react';

// Icon Quote dạng bong bóng hội thoại chứa dấu trích dẫn ""
function QuoteBubbleIcon({ className = 'w-5 h-5' }) {
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
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
      <path d="M8.5 9.5h1.5v2H8.5z" fill="currentColor" stroke="none" />
      <path d="M8.5 11.5c0 1-.5 1.5-1 2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 9.5H15v2h-1.5z" fill="currentColor" stroke="none" />
      <path d="M13.5 11.5c0 1-.5 1.5-1 2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function RepostModal({
  isOpen,
  onClose,
  isReposted = false,
  onRepost,
  onQuote,
}) {
  const modalRef = useRef(null);
  const { t } = useTranslation();

  // Đóng modal khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute left-0 top-full mt-1.5 w-48 sm:w-52 p-1.5 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none text-black dark:text-white"
      role="menu"
      aria-label="Tùy chọn đăng lại"
    >
      <div className="space-y-0.5">
        {/* Nút Repost / Đăng lại */}
        <button
          onClick={() => {
            if (onRepost) onRepost();
            onClose();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            isReposted
              ? 'text-red-500 hover:bg-red-500/10'
              : 'text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
          }`}
        >
          <span>
            {isReposted
              ? t('repostModal.removeRepost', 'Remove repost')
              : t('repostModal.repost', 'Repost')}
          </span>
          <Repeat2
            className={`w-5 h-5 stroke-[2.2] ${
              isReposted ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'
            }`}
          />
        </button>

        {/* Nút Quote / Trích dẫn */}
        <button
          onClick={() => {
            if (onQuote) onQuote();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <span>{t('repostModal.quote', 'Quote')}</span>
          <QuoteBubbleIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        </button>
      </div>
    </div>
  );
}
