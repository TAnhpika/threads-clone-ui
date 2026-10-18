import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  X,
  Image,
  Smile,
  SlidersHorizontal,
  ChevronRight,
  MoreHorizontal,
  FileText,
  BarChart2,
  Mic,
} from 'lucide-react';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { prependFeedPost } from '@/features/feed/feedSlice';
import userAvatar from '@/assets/images/ava.png';
import QuotedPostCard from './QuotedPostCard';

export default function QuoteModal({
  isOpen,
  onClose,
  quotedPost,
  onSubmitQuote,
  feedType = 'for_you',
}) {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const { t } = useTranslation();

  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const textareaRef = useRef(null);
  const modalRef = useRef(null);

  const avatarUrl = currentUser?.avatar || userAvatar;
  const username = currentUser?.username || currentUser?.name || 'user';

  const availableTopics = [
    'Smart Casual Men',
    'Old Money Aesthetic',
    'Menswear & Tailoring',
    'Quiet Luxury',
    'Streetwear & Sneakers',
    'Tech & Gadgets',
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setContent('');
      setSelectedTopic('');
      setShowTopicPicker(false);
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

  // Đóng modal khi click ra ngoài backdrop
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!content.trim()) return;

    const newPost = {
      id: `quote-${Date.now()}`,
      author: {
        id: currentUser?.id,
        name: currentUser?.name || 'User',
        username: currentUser?.username || 'user',
        avatar: avatarUrl,
        isVerified: true,
      },
      tag: selectedTopic || null,
      timestamp: 'vừa xong',
      content: content.trim(),
      quotedPost: quotedPost || null,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
      isReposted: false,
    };

    if (onSubmitQuote) {
      onSubmitQuote(newPost);
    } else {
      dispatch(prependFeedPost({ feedType, post: newPost }));
      window.dispatchEvent(
        new CustomEvent('app-toast', { detail: { message: 'Đã đăng bài trích dẫn ✨' } })
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div
        ref={modalRef}
        className="bg-[#141414] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white w-full max-w-135 animate-in zoom-in-95 duration-150"
      >
        {/* 1. Header: Cancel | New thread | Drafts & More */}
        <div className="relative px-5 py-3.5 flex items-center justify-between border-b border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </button>

          <h2 className="text-base font-bold tracking-tight absolute left-1/2 -translate-x-1/2 text-white">
            {t('createPost.newThread', 'New thread')}
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Chức năng bản nháp')}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Bản nháp"
            >
              <FileText className="w-5 h-5 stroke-[1.8]" />
            </button>
            <button
              type="button"
              onClick={() => showToast('Tùy chọn khác')}
              className="w-7 h-7 rounded-full border border-zinc-700/80 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Tuỳ chọn"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Body Soạn thảo Thread kèm Quoted Post */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col space-y-3">
          <div className="flex gap-3 items-start">
            {/* Cột Avatar & đường connector */}
            <div className="flex flex-col items-center shrink-0 self-stretch">
              <img
                src={avatarUrl}
                alt={username}
                className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
              />
              <div className="w-[1.5px] bg-zinc-800/90 flex-1 my-1.5 min-h-16" />
            </div>

            {/* Cột Nội dung */}
            <div className="flex-1 min-w-0">
              {/* Username & Topic selector */}
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

                {/* Dropdown chọn Topic */}
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

              {/* Textarea nhập suy nghĩ */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={2}
                className="w-full bg-transparent resize-none text-[15px] placeholder-zinc-500 text-white focus:outline-none leading-relaxed"
              />

              {/* Toolbar đính kèm */}
              <div className="flex items-center gap-3.5 text-zinc-500 my-2">
                <button
                  type="button"
                  title="Thêm ảnh"
                  onClick={() => showToast('Thêm ảnh')}
                  className="hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <Image className="w-5 h-5 stroke-[1.8]" />
                </button>
                <button
                  type="button"
                  title="GIF"
                  onClick={() => showToast('Chọn GIF')}
                  className="text-xs font-bold border border-zinc-600 rounded px-1 py-0.5 leading-none hover:text-zinc-200 hover:border-zinc-400 transition-colors cursor-pointer"
                >
                  GIF
                </button>
                <button
                  type="button"
                  title="Biểu cảm"
                  onClick={() => showToast('Chọn biểu cảm')}
                  className="hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <Smile className="w-5 h-5 stroke-[1.8]" />
                </button>
                <button
                  type="button"
                  title="Bình chọn"
                  onClick={() => showToast('Tạo bình chọn')}
                  className="hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <BarChart2 className="w-5 h-5 stroke-[1.8]" />
                </button>
                <button
                  type="button"
                  title="Ghi âm"
                  onClick={() => showToast('Ghi âm âm thanh')}
                  className="hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <Mic className="w-5 h-5 stroke-[1.8]" />
                </button>
              </div>

              {/* Quoted Post Card */}
              {quotedPost && (
                <div className="mt-3">
                  <QuotedPostCard
                    post={quotedPost}
                    onTranslate={() => showToast('Đang dịch bài viết...')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hàng "Add to thread" bên dưới */}
          <div className="flex items-center gap-3 pt-1">
            <img
              src={avatarUrl}
              alt="me"
              className="w-5 h-5 rounded-full object-cover border border-zinc-800 opacity-60 ml-2"
            />
            <button
              type="button"
              onClick={() => showToast('Thêm bài viết vào chuỗi thread')}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Add to thread
            </button>
          </div>

          {/* 3. Footer: Post options | Post button */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => showToast('Cài đặt quyền trả lời')}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Post options</span>
            </button>

            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4.5 py-1.5 rounded-xl bg-white text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            >
              Post
            </button>
          </div>
        </form>

        {/* Toast thông báo */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-semibold shadow-xl">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
