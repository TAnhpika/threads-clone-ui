import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updatePostData } from '@/features/feed/feedSlice';
import { updatePostApi, adaptPost } from '@/services/postService';
import userAvatar from '@/assets/images/default-avatar.svg';
import {
  ChevronRight,
  MoreHorizontal,
  SlidersHorizontal,
} from 'lucide-react';

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  currentUser,
  onUpdated,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [replyPermission, setReplyPermission] = useState('everyone');
  const [requiresReplyApproval, setRequiresReplyApproval] = useState(false);

  const textareaRef = useRef(null);
  const modalRef = useRef(null);

  const avatarUrl =
    currentUser?.avatar || post?.author?.avatar || userAvatar;
  const username =
    currentUser?.username || post?.author?.username || 'user';

  const availableTopics = [
    'Smart Casual Men',
    'Old Money Aesthetic',
    'Menswear & Tailoring',
    'Quiet Luxury',
    'Streetwear & Sneakers',
    'Tech & Gadgets',
  ];

  // Đồng bộ nội dung khi mở modal và auto-focus ở cuối văn bản
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const initialContent = post?.content || '';
      setContent(initialContent);
      setSelectedTopic(post?.tag || post?.topic?.name || '');
      setReplyPermission(post?.reply_permission || 'everyone');
      setRequiresReplyApproval(Boolean(post?.requires_reply_approval));

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setShowTopicPicker(false);
      setShowPostOptions(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, post]);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Đóng modal khi click ra ngoài
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
    const trimmedContent = content.trim();
    if (!trimmedContent || !post?.id) return;

    const postId = post.id;
    const prevContent = post.content || '';
    const prevTag = post.tag || post.topic?.name || null;
    const authorUsername = currentUser?.username || post?.author?.username || 'user';
    const chosenTopic = selectedTopic || '';
    const chosenReplyPermission = replyPermission || 'everyone';
    const chosenRequiresReplyApproval = requiresReplyApproval;

    // 1. Đóng modal ngay lập tức khi click Done
    onClose();

    // 2. Cập nhật lạc quan (Optimistic update) vào Redux store
    dispatch(
      updatePostData({
        postId,
        updates: {
          content: trimmedContent,
          tag: chosenTopic || null,
        },
      })
    );
    onUpdated?.({
      postId,
      content: trimmedContent,
      tag: chosenTopic || null,
    });

    // 3. Hiển thị Toast "Editing..." ngay lập tức (theo Ảnh mẫu 1)
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: {
          type: 'edit',
          status: 'loading',
          message: 'Editing...',
          postId,
          duration: 15000,
        },
      })
    );

    // 4. Gửi API ngầm trong background
    (async () => {
      try {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('content', trimmedContent);
        formData.append('reply_permission', chosenReplyPermission);
        if (chosenRequiresReplyApproval) {
          formData.append('requires_reply_approval', '1');
        }
        formData.append('topic_name', chosenTopic);

        const response = await updatePostApi(postId, formData);
        const postData = response?.data || response;
        const adapted = adaptPost(postData);

        // Đồng bộ dữ liệu mới nhất từ server
        dispatch(
          updatePostData({
            postId,
            updates: {
              ...(adapted || {}),
              content: trimmedContent,
              tag: chosenTopic || null,
            },
          })
        );
        onUpdated?.({
          postId,
          ...(adapted || {}),
          content: trimmedContent,
          tag: chosenTopic || null,
        });

        // Chuyển trạng thái Toast sang "✓ Edited  View" (theo Ảnh mẫu 2)
        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: {
              type: 'edit',
              status: 'completed',
              message: 'Edited',
              postId,
              authorUsername,
              duration: 4000,
            },
          })
        );
      } catch (err) {
        console.error('Update post error:', err);
        // Hoàn tác nội dung cũ nếu gọi API thất bại
        dispatch(
          updatePostData({
            postId,
            updates: {
              content: prevContent,
              tag: prevTag,
            },
          })
        );
        onUpdated?.({
          postId,
          content: prevContent,
          tag: prevTag,
        });

        const errData = err?.response?.data;
        let errMsg = 'Failed to update post. Please try again.';
        if (errData?.errors && typeof errData.errors === 'object') {
          const firstKey = Object.keys(errData.errors)[0];
          const firstVal = errData.errors[firstKey];
          errMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
        } else if (errData?.message) {
          errMsg = errData.message;
        } else if (err?.message) {
          errMsg = err.message;
        }

        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: {
              message: errMsg,
              duration: 4000,
            },
          })
        );
      }
    })();
  };

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
      <div
        ref={modalRef}
        className="w-full max-w-130 bg-[#141414] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white select-none animate-in zoom-in-95 duration-150"
      >
        {/* 1. Header: Trái (Cancel) - Giữa (Edit post) - Phải (...) */}
        <div className="relative px-5 py-3.5 flex items-center justify-between border-b border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-semibold text-zinc-300 hover:text-white transition-opacity cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </button>

          <h2 className="text-base font-bold tracking-tight absolute left-1/2 -translate-x-1/2 text-white">
            {t('postMenu.editPostTitle', 'Edit post')}
          </h2>

          {/* Nút (...) góc phải trong vòng tròn */}
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

        {/* 2. Body Chỉnh sửa bài viết */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col space-y-3">
          <div className="flex gap-3 items-start">
            {/* Avatar */}
            <div className="shrink-0">
              <img
                src={avatarUrl}
                alt={username}
                className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
              />
            </div>

            {/* Cột thông tin tác giả, topic & nội dung */}
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

              {/* Textarea nội dung bài viết */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's new?"
                rows={3}
                maxLength={500}
                className="w-full bg-transparent resize-none text-[15px] placeholder-zinc-500 text-white focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* 3. Footer Options: [††] Post options & Nút Done */}
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
                <div className="absolute left-0 bottom-full mb-2 bg-[#1e1e1e] border border-zinc-700 rounded-2xl p-2 shadow-2xl w-64 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Who can reply & quote
                  </div>
                  {[
                    { id: 'everyone', label: 'Anyone' },
                    { id: 'following', label: 'Profiles you follow' },
                    { id: 'followers', label: 'Followers' },
                    { id: 'mentions', label: 'Profiles you mention' },
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

                  {/* Requires reply approval */}
                  <div
                    className="pt-2 mt-1 border-t border-zinc-800/80 flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-zinc-800/40 rounded-xl transition-colors"
                    onClick={() => setRequiresReplyApproval((prev) => !prev)}
                  >
                    <span className="text-xs text-zinc-300 font-medium select-none">
                      Require approval for replies
                    </span>
                    <input
                      type="checkbox"
                      checked={requiresReplyApproval}
                      onChange={(e) => setRequiresReplyApproval(e.target.checked)}
                      className="w-4 h-4 rounded accent-white cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Nút Done */}
            <button
              type="submit"
              disabled={!content.trim()}
              className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                content.trim()
                  ? 'bg-white text-black hover:opacity-90 active:scale-95 cursor-pointer shadow-sm'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
              }`}
            >
              {t('common.done', 'Done')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
