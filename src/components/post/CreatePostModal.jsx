import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Smile, Hash, X } from 'lucide-react';

export default function CreatePostModal({
  isOpen,
  onClose,
  currentUser,
  onSubmitPost,
}) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const textareaRef = useRef(null);
  const modalRef = useRef(null);
  const { t } = useTranslation();

  const avatarUrl =
    currentUser?.avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
  const username = currentUser?.username || currentUser?.name || 'you';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    if (onSubmitPost) {
      onSubmitPost({
        content: content.trim(),
        media: imageUrl
          ? {
              url: imageUrl,
              alt: 'User posted media',
            }
          : null,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-black dark:text-white"
      >
        {/* Header */}
        <div className="relative px-5 py-3.5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 hover:opacity-75 transition-opacity cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <h2 className="text-[16px] font-bold text-center absolute left-1/2 -translate-x-1/2">
            {t('createPost.newThread', 'New thread')}
          </h2>
          <div className="w-12" aria-hidden="true" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <img
              src={avatarUrl}
              alt={username}
              className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 mt-0.5"
            />

            {/* Nội dung bài viết */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-black dark:text-white mb-1">
                {username}
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('createPost.whatsNew', "What's new?")}
                rows={4}
                className="w-full bg-transparent resize-none text-[15px] placeholder-zinc-400 dark:placeholder-zinc-500 text-black dark:text-white focus:outline-none leading-relaxed"
              />

              {/* Preview ảnh đính kèm (nếu có) */}
              {imageUrl && (
                <div className="relative mt-2 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-60 group">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className="w-full h-auto object-cover max-h-60"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Ô nhập URL hình ảnh khi bấm icon ảnh */}
              {showImageInput && !imageUrl && (
                <div className="mt-2 flex items-center gap-2 animate-in fade-in duration-150">
                  <input
                    type="url"
                    placeholder="Dán URL hình ảnh..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowImageInput(false)}
                    className="text-xs text-zinc-500 hover:text-black dark:hover:text-white"
                  >
                    Đóng
                  </button>
                </div>
              )}

              {/* Toolbar đính kèm */}
              <div className="flex items-center gap-3 mt-3 text-zinc-400 dark:text-zinc-500">
                <button
                  type="button"
                  onClick={() => setShowImageInput((prev) => !prev)}
                  className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Thêm hình ảnh"
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Thêm hashtag"
                >
                  <Hash className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Biểu cảm"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {t('createPost.anyoneCanReply', 'Anyone can reply & quote')}
            </span>

            <button
              type="submit"
              disabled={!content.trim() && !imageUrl}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all cursor-pointer ${
                content.trim() || imageUrl
                  ? 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
              }`}
            >
              {t('createPost.postBtn', 'Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
