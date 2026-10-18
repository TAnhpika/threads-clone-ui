import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { prependFeedPost } from '@/features/feed/feedSlice';
import userAvatar from '@/assets/images/ava.png';
import QuotedPostCard from './QuotedPostCard';
import {
  X,
  Image,
  Smile,
  MapPin,
  Music,
  Quote,
  SlidersHorizontal,
  ChevronRight,
  MoreHorizontal,
  Plus,
} from 'lucide-react';

export default function CreatePostModal({
  isOpen,
  onClose,
  currentUser,
  onSubmitPost,
  quotedPost = null,
  placement = 'center', // 'center' | 'bottom-right'
  feedType = 'for_you',
}) {
  const dispatch = useDispatch();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [replyPermission, setReplyPermission] = useState('anyone'); // 'anyone' | 'profiles_you_follow' | 'mentioned_only'
  const [threadList, setThreadList] = useState([]); // Chained threads if user clicks "Add to thread"

  const textareaRef = useRef(null);
  const modalRef = useRef(null);
  const { t } = useTranslation();

  const isCorner = placement === 'bottom-right';

  const avatarUrl = currentUser?.avatar || userAvatar;
  const username = currentUser?.username || currentUser?.name || 'tuananhpika';

  const placeholderText = quotedPost
    ? 'Share your thoughts...'
    : t('createPost.whatsNew', "What's new?");

  const availableTopics = [
    'Smart Casual Men',
    'Old Money Aesthetic',
    'Menswear & Tailoring',
    'Quiet Luxury',
    'Streetwear & Sneakers',
    'Tech & Gadgets',
  ];

  useEffect(() => {
    if (isOpen) {
      if (!isCorner) {
        document.body.style.overflow = 'hidden';
      }
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      setSelectedTopic('');
      setShowTopicPicker(false);
      setShowPostOptions(false);
      setThreadList([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isCorner]);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Đóng modal khi click ra ngoài (đặc biệt hữu ích khi ở chế độ bottom-right)
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Kiểm tra xem click có phải vào nút nổi [+] không (để tránh double toggle)
        const toggleBtn = document.getElementById('floating-new-thread-btn');
        if (toggleBtn && toggleBtn.contains(event.target)) {
          return;
        }
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    const postPayload = {
      content: content.trim(),
      topic: selectedTopic || null,
      quotedPost: quotedPost || null,
      media: imageUrl
        ? {
            url: imageUrl,
            alt: 'User posted media',
          }
        : null,
    };

    if (onSubmitPost) {
      onSubmitPost(postPayload);
    } else {
      const newPost = {
        id: `post-${Date.now()}`,
        author: {
          id: currentUser?.id,
          name: currentUser?.name || 'User',
          username: currentUser?.username || currentUser?.name || 'user',
          avatar: avatarUrl,
          isVerified: true,
        },
        tag: postPayload.topic,
        timestamp: 'vừa xong',
        content: postPayload.content,
        quotedPost: postPayload.quotedPost,
        media: postPayload.media,
        likes: 0,
        comments: 0,
        reposts: 0,
        shares: 0,
        isLiked: false,
        isSaved: false,
        isReposted: false,
      };

      dispatch(prependFeedPost({ feedType, post: newPost }));
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: {
            message: quotedPost
              ? 'Đã đăng bài trích dẫn thành công ✨'
              : 'Đã đăng bài viết mới thành công ✨',
          },
        })
      );
    }

    onClose();
  };

  const handleAddThread = () => {
    if (content.trim()) {
      setThreadList([...threadList, content.trim()]);
      setContent('');
      textareaRef.current?.focus();
    }
  };

  // Container modal nội dung
  const modalContent = (
    <div
      ref={modalRef}
      className={`bg-[#141414] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white select-none ${
        isCorner
          ? 'w-[calc(100vw-2rem)] sm:w-120 max-w-120 animate-in slide-in-from-bottom-4 zoom-in-95 duration-150'
          : 'w-full max-w-130 animate-in zoom-in-95 duration-150'
      }`}
    >
      {/* 1. Header: Trái (Cancel hoặc X) - Giữa (New thread) - Phải (Drafts & More ...) */}
      <div className="relative px-5 py-3.5 flex items-center justify-between border-b border-zinc-800/80">
        {isCorner ? (
          /* Nút X đóng ở góc phải */
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Đóng"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        ) : (
          /* Nút Cancel khi ở giữa màn hình */
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-semibold text-zinc-300 hover:text-white transition-opacity cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </button>
        )}

        {/* Tiêu đề New thread ở giữa */}
        <h2 className="text-base font-bold tracking-tight absolute left-1/2 -translate-x-1/2 text-white">
          {t('createPost.newThread', 'New thread')}
        </h2>

        {/* Icon Bản nháp (Drafts) & Icon More (...) trong vòng tròn */}
        <div className="flex items-center gap-2.5">
          {/* Icon file nháp có góc gập */}
          <button
            type="button"
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Bản nháp"
            aria-label="Bản nháp"
          >
            <svg
              className="w-5 h-5 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </button>

          {/* Icon More (...) trong vòng tròn */}
          <button
            type="button"
            className="p-0.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Tùy chọn khác"
            aria-label="Tùy chọn khác"
          >
            <div className="w-6 h-6 rounded-full border border-zinc-400/90 flex items-center justify-center">
              <MoreHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>

      {/* 2. Body Soạn thảo Thread */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col space-y-3">
        {/* Thread trước đó nếu đã bấm Add to thread */}
        {threadList.map((threadText, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <img
                src={avatarUrl}
                alt={username}
                className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
              />
              <div className="w-0.5 bg-zinc-800 flex-1 my-1" />
            </div>
            <div className="flex-1 text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
              {threadText}
            </div>
          </div>
        ))}

        {/* Thread hiện tại đang viết */}
        <div className="flex gap-3 items-start">
          {/* Cột Avatar và đường kết nối xuống dưới */}
          <div className="flex flex-col items-center shrink-0 self-stretch">
            <img
              src={avatarUrl}
              alt={username}
              className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
            />
            {/* Đường kết nối thread */}
            <div className="w-[1.5px] bg-zinc-800/90 flex-1 my-1.5 min-h-10" />
          </div>

          {/* Cột Nội dung */}
          <div className="flex-1 min-w-0">
            {/* Username & Topic Selector */}
            <div className="flex items-center gap-1.5 mb-1.5 relative">
              <span className="text-sm font-bold text-white hover:underline cursor-pointer">
                {username}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <button
                type="button"
                onClick={() => setShowTopicPicker((prev) => !prev)}
                className="text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer truncate max-w-50"
              >
                {selectedTopic || 'Community or topic'}
              </button>

              {/* Popover chọn Topic */}
              {showTopicPicker && (
                <div className="absolute left-16 top-6 z-50 bg-[#1e1e1e] border border-zinc-700/80 rounded-2xl p-2 shadow-2xl w-52 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-400 uppercase">
                    Select Topic
                  </div>
                  {availableTopics.map((top) => (
                    <button
                      key={top}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(top);
                        setShowTopicPicker(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-zinc-800 text-zinc-200 hover:text-white transition-colors cursor-pointer"
                    >
                      {top}
                    </button>
                  ))}
                  {selectedTopic && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTopic('');
                        setShowTopicPicker(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-xs text-red-400 hover:bg-zinc-800 rounded-xl"
                    >
                      Clear topic
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Input Văn bản */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholderText}
              rows={3}
              className="w-full bg-transparent resize-none text-[15px] placeholder-zinc-500 text-white focus:outline-none leading-relaxed"
            />

            {/* Preview Ảnh (nếu có) */}
            {imageUrl && (
              <div className="relative mt-2 rounded-2xl overflow-hidden border border-zinc-800 max-h-56 group">
                <img
                  src={imageUrl}
                  alt="Attached media"
                  className="w-full h-auto object-cover max-h-56"
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

            {/* Input dán URL hình ảnh */}
            {showImageInput && !imageUrl && (
              <div className="mt-2 flex items-center gap-2 animate-in fade-in duration-150">
                <input
                  type="url"
                  placeholder="Paste image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowImageInput(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}

            {/* Toolbar 9 icons chuẩn Threads */}
            <div className="flex items-center gap-3.5 mt-2.5 text-zinc-500">
              {/* 1. Image */}
              <button
                type="button"
                onClick={() => setShowImageInput((prev) => !prev)}
                className="hover:text-zinc-300 transition-colors cursor-pointer"
                title="Add Image"
              >
                <Image className="w-5 h-5" />
              </button>

              {/* 2. GIF */}
              <button
                type="button"
                className="hover:text-zinc-300 transition-colors cursor-pointer"
                title="Add GIF"
              >
                <span className="text-[10px] font-black tracking-tight border border-current rounded px-1 py-0.5 leading-none select-none inline-block">
                  GIF
                </span>
              </button>

              {/* 3. Smile */}
              <button
                type="button"
                className="hover:text-zinc-300 transition-colors cursor-pointer"
                title="Add Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* 4. Sticker / Sticky note */}
              <button
                type="button"
                className="hover:text-zinc-300 transition-colors cursor-pointer"
                title="Add Sticker"
              >
                <svg
                  className="w-5 h-5 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <circle cx="10" cy="13" r="1" fill="currentColor" />
                  <path d="M9 16c.8.5 1.6.5 2.4 0" />
                </svg>
              </button>

              {/* 5. Poll / Bars */}
              <button
                type="button"
                className="hover:text-zinc-300 transition-colors cursor-pointer"
                title="Create Poll"
              >
                <svg
                  className="w-5 h-5 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 6h16" />
                  <path d="M4 12h10" />
                  <path d="M4 18h14" />
                </svg>
              </button>

              {/* 6. Quote */}
              <button
                type="button"
                className="hover:text-zinc-300 transition-colors cursor-pointer"
                title="Add Quote"
              >
                <Quote className="w-5 h-5" />
              </button>

              {/* 7. Checklist / List */}
              <button
                type="button"
                className="hover:text-zinc-300 transition-colors cursor-pointer"
                title="Add Checklist"
              >
                <svg
                  className="w-5 h-5 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M7 8h10" />
                  <path d="M7 12h10" />
                  <path d="M7 16h6" />
                </svg>
              </button>

              {/* 8. Map Pin */}
              <button
                type="button"
                className="hover:text-zinc-300 transition-colors cursor-pointer"
                title="Add Location"
              >
                <MapPin className="w-5 h-5" />
              </button>

              {/* 9. Music note */}
              <button
                type="button"
                className="hover:text-zinc-300 transition-colors cursor-pointer"
                title="Add Audio"
              >
                <Music className="w-5 h-5" />
              </button>
            </div>

            {/* Quoted Post Card (nếu đang ở chế độ Quote) */}
            {quotedPost && (
              <div className="mt-3">
                <QuotedPostCard post={quotedPost} />
              </div>
            )}
          </div>
        </div>

        {/* Hàng: Avatar nhỏ + 'Add to thread' */}
        <div className="flex items-center gap-3 pt-1">
          <img
            src={avatarUrl}
            alt={username}
            className="w-5 h-5 rounded-full object-cover border border-zinc-800 opacity-60 ml-2"
          />
          <button
            type="button"
            onClick={handleAddThread}
            className="text-[13px] text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer"
          >
            Add to thread
          </button>
        </div>

        {/* 3. Footer Options: [††] Post options & Nút Post */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between relative">
          {/* Post options */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPostOptions((prev) => !prev)}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors text-xs sm:text-[13px] font-medium cursor-pointer"
            >
              <div className="w-5 h-5 rounded-md border border-zinc-700/80 flex items-center justify-center">
                <SlidersHorizontal className="w-3 h-3 stroke-[2.2]" />
              </div>
              <span>Post options</span>
            </button>

            {/* Menu Post options */}
            {showPostOptions && (
              <div className="absolute left-0 bottom-full mb-2 bg-[#1e1e1e] border border-zinc-700 rounded-2xl p-2 shadow-2xl w-60 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Who can reply & quote
                </div>
                {[
                  { id: 'anyone', label: 'Anyone' },
                  { id: 'profiles_you_follow', label: 'Profiles you follow' },
                  { id: 'mentioned_only', label: 'Profiles you mention' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setReplyPermission(opt.id);
                      setShowPostOptions(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      replyPermission === opt.id
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {replyPermission === opt.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nút Post */}
          <button
            type="submit"
            disabled={!content.trim() && !imageUrl}
            className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all ${
              content.trim() || imageUrl
                ? 'bg-white text-black hover:opacity-90 active:scale-95 cursor-pointer shadow-sm'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
            }`}
          >
            {t('createPost.postBtn', 'Post')}
          </button>
        </div>
      </form>
    </div>
  );

  // Render tùy theo placement
  if (isCorner) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        {modalContent}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      {modalContent}
    </div>
  );
}
