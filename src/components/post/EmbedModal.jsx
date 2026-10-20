import { useState, useEffect } from 'react';
import copy from 'copy-to-clipboard';
import { Check } from 'lucide-react';
import { getEmbedUrl } from '@/utils/postUrl';

export default function EmbedModal({
  isOpen,
  onClose,
  post,
  postId,
  onSuccessFeedback,
}) {
  const [isCopied, setIsCopied] = useState(false);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cuộn trang khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsCopied(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const currentPostId = postId || post?.id || '';
  const embedUrl = getEmbedUrl(post, currentPostId);
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`;

  const handleCopyCode = () => {
    copy(iframeSnippet);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(iframeSnippet).catch(() => {});
    }
    setIsCopied(true);
    if (onSuccessFeedback) {
      onSuccessFeedback('Đã sao chép mã nhúng vào bộ nhớ tạm 📋');
    }
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="embed-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[540px] bg-[#1c1c1e] border border-zinc-800 rounded-[28px] shadow-2xl p-4 sm:p-6 text-white animate-in zoom-in-95 duration-150 flex flex-col gap-4 relative"
      >
        {/* 1. Preview bằng thẻ iframe trỏ tới trang Embed */}
        <div className="w-full bg-white rounded-2xl overflow-hidden shadow-lg border border-zinc-200 flex items-center justify-center">
          <iframe
            src={embedUrl}
            title="Threads post embed preview"
            className="w-full h-[440px] sm:h-[460px] border-0 block bg-white"
            scrolling="no"
            loading="lazy"
            allowTransparency="true"
          />
        </div>

        {/* 2. Khung chứa Code Embed và Nút Copy */}
        <div className="bg-[#101012] border border-zinc-750 rounded-2xl p-2.5 pl-4 flex items-center justify-between gap-3 shadow-inner">
          <code className="font-mono text-xs text-zinc-300 truncate select-all">
            {iframeSnippet}
          </code>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md active:scale-95"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Copied
              </>
            ) : (
              'Copy'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
