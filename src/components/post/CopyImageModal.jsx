import { useState, useEffect, useRef } from 'react';
import { toPng, toBlob } from 'html-to-image';
import download from 'downloadjs';
import { Download, Check, Heart, MessageCircle, Repeat2, Send, ChevronDown } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThreads } from '@fortawesome/free-brands-svg-icons';
import defaultAvatar from '@/assets/images/default-avatar.svg';
import { getAuthorAvatar } from '@/utils/avatar';

export default function CopyImageModal({
  isOpen,
  onClose,
  post,
  onSuccessFeedback,
}) {
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [showMetrics, setShowMetrics] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('auto'); // 'auto' | 'square'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef(null);

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
      setIsDownloaded(false);
      setIsDownloading(false);
      setIsCopied(false);
      setIsCopying(false);
      setIsDropdownOpen(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const author = post.author || post.user || {};
  const authorUsername = author.username || 'user';
  const authorAvatar = author.avatar || getAuthorAvatar(author);
  const postContent = post.content || '';
  const postTimestamp = post.timestamp || '8h';
  const postMediaUrl =
    post.media?.url ||
    (Array.isArray(post.media_urls) && post.media_urls[0]) ||
    (Array.isArray(post.media?.urls) && post.media.urls[0]) ||
    null;

  const likesCount = post.likes ?? 580;
  const commentsCount = post.comments ?? 73;
  const repostsCount = post.reposts ?? 30;
  const sharesCount = post.shares ?? 23;

  // Xử lý tải ảnh sử dụng html-to-image và downloadjs
  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: theme === 'dark' ? '#101010' : '#ffffff',
      });

      const fileName = `threads-${authorUsername}-${post?.id || Date.now()}.png`;
      download(dataUrl, fileName, 'image/png');

      setIsDownloading(false);
      setIsDownloaded(true);
      if (onSuccessFeedback) {
        onSuccessFeedback('Đã tải ảnh bài viết thành công 📥');
      }

      setTimeout(() => {
        setIsDownloaded(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error('Lỗi xuất ảnh với html-to-image:', err);
      try {
        const dataUrl = await toPng(cardRef.current, {
          pixelRatio: 2,
          backgroundColor: theme === 'dark' ? '#101010' : '#ffffff',
        });
        const fileName = `threads-${authorUsername}.png`;
        download(dataUrl, fileName, 'image/png');
        setIsDownloading(false);
        setIsDownloaded(true);
        if (onSuccessFeedback) {
          onSuccessFeedback('Đã tải ảnh bài viết thành công 📥');
        }
        setTimeout(() => {
          setIsDownloaded(false);
          onClose();
        }, 800);
      } catch (fallbackErr) {
        console.error('Fallback export error:', fallbackErr);
        setIsDownloading(false);
        if (onSuccessFeedback) {
          onSuccessFeedback('Không thể xuất ảnh bài viết, vui lòng thử lại');
        }
      }
    }
  };

  // Xử lý sao chép ảnh vào Clipboard
  const handleCopy = async () => {
    if (!cardRef.current || isCopying) return;
    setIsCopying(true);

    try {
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: theme === 'dark' ? '#101010' : '#ffffff',
      });

      if (blob && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setIsCopying(false);
        setIsCopied(true);
        if (onSuccessFeedback) {
          onSuccessFeedback('Đã sao chép ảnh vào bộ nhớ tạm 📋');
        }
        setTimeout(() => {
          setIsCopied(false);
          onClose();
        }, 800);
      } else {
        throw new Error('ClipboardItem API không khả dụng');
      }
    } catch (err) {
      console.error('Lỗi sao chép ảnh vào clipboard:', err);
      // Tự động tải ảnh về nếu trình duyệt chặn Clipboard API
      handleDownload();
    } finally {
      setIsCopying(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-modal-title"
    >
      {/* Khung Modal chính: bo tròn bo góc lớn chuẩn mẫu Threads */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] bg-[#1c1c1e] border border-zinc-800 rounded-[28px] shadow-2xl p-4 sm:p-6 text-white animate-in zoom-in-95 duration-150 flex flex-col gap-4"
      >
        {/* 1. Preview Card DOM Node được chụp bởi html-to-image */}
        <div
          ref={cardRef}
          className={`w-full rounded-[22px] p-5 sm:p-6 transition-colors shadow-lg ${
            isDark
              ? 'bg-[#101010] text-white border border-white/10'
              : 'bg-white text-black border border-black/10'
          } ${aspectRatio === 'square' ? 'aspect-square flex flex-col justify-between' : ''}`}
        >
          {/* Header Card: Avatar + Username + Timestamp */}
          <div className="flex items-center gap-3">
            <img
              src={authorAvatar}
              alt={authorUsername}
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src = defaultAvatar;
              }}
              className={`w-9 h-9 rounded-full object-cover shrink-0 ${
                isDark ? 'border border-zinc-700/80' : 'border border-zinc-200'
              }`}
            />
            <div className="flex items-center gap-2">
              <span className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {authorUsername}
              </span>
              <span className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {postTimestamp}
              </span>
            </div>
          </div>

          {/* Nội dung bài viết */}
          {postContent && (
            <p
              className={`text-[15px] leading-relaxed my-3.5 whitespace-pre-line font-normal ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              {postContent}
            </p>
          )}

          {/* Ảnh đính kèm (nếu có) */}
          {postMediaUrl && (
            <div className="my-3 rounded-xl overflow-hidden max-h-72 bg-black/40 border border-zinc-800/80">
              <img
                src={postMediaUrl}
                alt="attachment"
                crossOrigin="anonymous"
                className="w-full h-full object-cover max-h-72"
              />
            </div>
          )}

          {/* Dải dưới: Thống kê số liệu (bên trái) & Biểu tượng Threads logo (bên phải) */}
          <div className="flex items-center justify-between pt-2">
            {/* Thống kê tương tác (Ẩn/Hiện dựa trên Show metrics) */}
            <div
              className={`flex items-center gap-4 text-[13px] transition-opacity duration-150 ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              } ${showMetrics ? 'opacity-100' : 'opacity-0 select-none pointer-events-none'}`}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Heart className="w-4 h-4 stroke-[2]" />
                {likesCount}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MessageCircle className="w-4 h-4 stroke-[2]" />
                {commentsCount}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Repeat2 className="w-4 h-4 stroke-[2]" />
                {repostsCount}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Send className="w-4 h-4 stroke-[2]" />
                {sharesCount}
              </span>
            </div>

            {/* Logo Threads ở góc phải phía dưới */}
            <div className={`shrink-0 ml-auto flex items-center justify-center ${isDark ? 'text-white' : 'text-black'}`}>
              <FontAwesomeIcon icon={faThreads} className="text-xl" />
            </div>
          </div>
        </div>

        {/* 2. Bộ chọn Theme màu: Nút tròn Trắng & Nút tròn Đen có viền xanh */}
        <div className="flex items-center gap-3 pt-1">
          {/* Nút theme Trắng (Light) */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`w-6 h-6 rounded-full bg-white transition-all cursor-pointer ${
              !isDark ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1c1c1e]' : 'opacity-90 hover:opacity-100'
            }`}
            title="Light theme"
            aria-label="Light theme"
          />

          {/* Nút theme Đen (Dark) */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`w-6 h-6 rounded-full bg-[#101010] border border-zinc-700 transition-all cursor-pointer ${
              isDark ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1c1c1e]' : 'opacity-90 hover:opacity-100'
            }`}
            title="Dark theme"
            aria-label="Dark theme"
          />
        </div>

        {/* 3. Dải điều khiển Footer: Show metrics, Dropdown Auto, Nút Download & Nút Copy */}
        <div className="flex items-center justify-between pt-1">
          {/* Checkbox "Show metrics" */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showMetrics}
              onChange={(e) => setShowMetrics(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                showMetrics
                  ? 'bg-white text-black'
                  : 'border border-zinc-600 bg-transparent'
              }`}
            >
              {showMetrics && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span className="text-[13.5px] font-medium text-white">Show metrics</span>
          </label>

          {/* Nhóm nút bên phải: Dropdown Auto + Download + Copy */}
          <div className="flex items-center gap-2.5">
            {/* Dropdown "Auto ⌵" */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-10 px-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{aspectRatio === 'square' ? 'Square' : 'Auto'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute bottom-full mb-1.5 left-0 w-28 bg-[#252528] border border-zinc-700 rounded-xl shadow-xl overflow-hidden py-1 z-10 text-xs text-white">
                  <button
                    type="button"
                    onClick={() => {
                      setAspectRatio('auto');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-zinc-700/80 cursor-pointer ${
                      aspectRatio === 'auto' ? 'text-blue-400 font-bold' : ''
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAspectRatio('square');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-zinc-700/80 cursor-pointer ${
                      aspectRatio === 'square' ? 'text-blue-400 font-bold' : ''
                    }`}
                  >
                    Square
                  </button>
                </div>
              )}
            </div>

            {/* Nút Download icon (khay tải xuống) */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isCopying}
              title="Download image"
              className="w-10 h-10 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isDownloaded ? (
                <Check className="w-4 h-4 stroke-[2.5] text-green-400" />
              ) : isDownloading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {/* Nút Copy: viên thuốc màu trắng chữ đen */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={isDownloading || isCopying}
              className="h-10 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 disabled:opacity-70"
            >
              {isCopied ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 stroke-[3]" />
                  Copied
                </span>
              ) : isCopying ? (
                'Copying...'
              ) : (
                'Copy'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
