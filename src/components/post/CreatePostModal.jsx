import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { prependFeedPost, updatePostInteraction } from '@/features/feed/feedSlice';
import {
  createPostApi,
  quotePostApi,
  createReplyApi,
  adaptPost,
  savePostCommentsCount,
  getCachedCommentsCount,
} from '@/services/postService';
import userAvatar from '@/assets/images/default-avatar.svg';
import { getAuthorAvatar } from '@/utils/avatar';
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
  AlertCircle,
} from 'lucide-react';

export default function CreatePostModal({
  isOpen,
  onClose,
  currentUser,
  onSubmitPost,
  quotedPost = null,
  replyToPost = null,
  isReplyModal = false,
  initialContent = '',
  initialMediaFiles = [],
  initialMediaPreviews = [],
  onReplySuccess,
  placement = 'center', // 'center' | 'bottom-right'
  feedType = 'for_you',
}) {
  const dispatch = useDispatch();
  const createEmptyThread = () => ({
    id: `thread-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    content: '',
    mediaFiles: [],
    mediaPreviews: [],
    imageUrl: '',
  });

  const [threads, setThreads] = useState([
    {
      id: 'thread-1',
      content: initialContent || '',
      mediaFiles: [],
      mediaPreviews: [],
      imageUrl: '',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [replyPermission, setReplyPermission] = useState('everyone'); // 'everyone' | 'following' | 'followers' | 'mentions'
  const [requiresReplyApproval, setRequiresReplyApproval] = useState(false);

  const textareaRefs = useRef({});
  const fileInputRefs = useRef({});
  const modalRef = useRef(null);
  const { t } = useTranslation();

  const isCorner = placement === 'bottom-right';

  const avatarUrl = currentUser?.avatar || userAvatar;
  const username = currentUser?.username || currentUser?.name || 'tuananhpika';

  const placeholderText = replyToPost
    ? 'Say more...'
    : quotedPost
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

  const hasParent = Boolean(replyToPost);
  const totalCount = (hasParent ? 1 : 0) + threads.length;
  const showBadge = totalCount >= 2;

  useEffect(() => {
    if (isOpen) {
      if (!isCorner) {
        document.body.style.overflow = 'hidden';
      }
      setThreads([
        {
          id: 'thread-1',
          content: initialContent || '',
          mediaFiles: initialMediaFiles || [],
          mediaPreviews: initialMediaPreviews || [],
          imageUrl: '',
        },
      ]);
      setTimeout(() => {
        if (textareaRefs.current[0]) {
          textareaRefs.current[0].focus();
          if (initialContent) {
            textareaRefs.current[0].selectionStart = textareaRefs.current[0].value.length;
            textareaRefs.current[0].selectionEnd = textareaRefs.current[0].value.length;
          }
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setSelectedTopic('');
      setShowTopicPicker(false);
      setShowPostOptions(false);
      setReplyPermission('everyone');
      setRequiresReplyApproval(false);
      setIsSubmitting(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isCorner, initialContent]);

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

  const handleFilesSelect = (index, e) => {
    const rawSelected = Array.from(e.target.files || []);
    if (rawSelected.length === 0) return;

    const validFiles = [];
    const newPreviews = [];

    for (const file of rawSelected) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: { message: `Tệp "${file.name}" không đúng định dạng ảnh hoặc video.` },
          })
        );
        continue;
      }

      // Giới hạn dung lượng: 25MB cho ảnh, 50MB cho video
      const maxSize = isVideo ? 50 * 1024 * 1024 : 25 * 1024 * 1024;
      if (file.size > maxSize) {
        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: {
              message: `Tệp "${file.name}" vượt quá dung lượng tối đa (${isVideo ? '50MB' : '25MB'}).`,
            },
          })
        );
        continue;
      }

      validFiles.push(file);
      newPreviews.push({
        file,
        url: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image',
        hasError: false,
      });
    }

    if (validFiles.length > 0) {
      setThreads((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          mediaFiles: [...(next[index].mediaFiles || []), ...validFiles],
          mediaPreviews: [...(next[index].mediaPreviews || []), ...newPreviews],
        };
        return next;
      });
    }
    e.target.value = '';
  };

  const handleMediaLoadError = (threadIndex, mediaIndex) => {
    setThreads((prev) => {
      const next = [...prev];
      const target = next[threadIndex];
      if (!target || !target.mediaPreviews?.[mediaIndex]) return prev;
      const updatedPreviews = [...target.mediaPreviews];
      updatedPreviews[mediaIndex] = {
        ...updatedPreviews[mediaIndex],
        hasError: true,
      };
      next[threadIndex] = {
        ...target,
        mediaPreviews: updatedPreviews,
      };
      return next;
    });
  };

  const handleRemoveMedia = (threadIndex, mediaIndex) => {
    setThreads((prev) => {
      const next = [...prev];
      const target = next[threadIndex];
      if (!target) return prev;
      const previewItem = target.mediaPreviews?.[mediaIndex];
      if (previewItem?.url) URL.revokeObjectURL(previewItem.url);

      next[threadIndex] = {
        ...target,
        mediaPreviews: target.mediaPreviews.filter((_, i) => i !== mediaIndex),
        mediaFiles: target.mediaFiles.filter((_, i) => i !== mediaIndex),
      };
      return next;
    });
  };

  const handleAddThread = () => {
    const newThread = createEmptyThread();
    const newIndex = threads.length;
    setThreads((prev) => [...prev, newThread]);
    setTimeout(() => {
      textareaRefs.current[newIndex]?.focus();
    }, 50);
  };

  const handleRemoveThread = (indexToRemove) => {
    if (threads.length <= 1) return;
    setThreads((prev) => {
      const target = prev[indexToRemove];
      target.mediaPreviews?.forEach((p) => {
        if (p?.url) URL.revokeObjectURL(p.url);
      });
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleUpdateThreadContent = (index, value) => {
    setThreads((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], content: value };
      return next;
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasAnyMediaError) {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: 'Vui lòng xóa các tệp bị lỗi trước khi đăng.' },
        })
      );
      return;
    }
    const validThreads = threads.filter(
      (t) => t.content.trim() || (t.mediaFiles && t.mediaFiles.length > 0) || t.imageUrl
    );
    if (validThreads.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (replyToPost?.id) {
        // 1. Đóng modal ngay lập tức khi click Post
        onClose();

        // 2. Kích hoạt Toast trạng thái đang gửi: [Spinner] Posting...
        window.dispatchEvent(
          new CustomEvent('app-toast', {
            detail: {
              type: 'reply',
              status: 'loading',
              message: 'Posting...',
            },
          })
        );

        try {
          let previousPostId = replyToPost.id;
          let firstReply = null;
          const createdReplies = [];
          const threadGroupId = `thread-group-${Date.now()}`;
          const hasMultipleThreads = totalCount >= 2;

          for (let i = 0; i < validThreads.length; i++) {
            const tItem = validThreads[i];
            const formData = new FormData();
            const textContent = tItem.content.trim();
            formData.append('content', textContent || '.');
            (tItem.mediaFiles || []).forEach((file) => {
              formData.append('media[]', file);
            });
            if (selectedTopic && i === 0) {
              formData.append('topic_name', selectedTopic);
            }

            const response = await createReplyApi(previousPostId, formData);
            const serverReply = (response && response.media !== undefined)
              ? response
              : adaptPost(response?.data || response);

            const threadIndexNumber = (hasParent ? 1 : 0) + i + 1;
            const isLast = i === validThreads.length - 1;

            const finalReply = {
              id: serverReply?.id || `reply-${Date.now()}-${i}`,
              ...(serverReply || {}),
              author: {
                ...(serverReply?.author || {}),
                id: (serverReply?.author?.id && serverReply?.author?.username !== 'user')
                  ? serverReply.author.id
                  : (currentUser?.id || 'me'),
                username: (serverReply?.author?.username && serverReply?.author?.username !== 'user')
                  ? serverReply.author.username
                  : (currentUser?.username || 'user'),
                avatar: (serverReply?.author?.avatar && !serverReply?.author?.avatar?.includes('default-avatar'))
                  ? serverReply.author.avatar
                  : (currentUser?.avatar || userAvatar),
              },
              timestamp: serverReply?.timestamp || '1m',
              content: textContent,
              media: serverReply?.media || (tItem.mediaPreviews?.length > 0 ? {
                url: tItem.mediaPreviews[0].url,
                urls: tItem.mediaPreviews.map((m) => m.url),
              } : null),
              likes: serverReply?.likes || 0,
              comments: serverReply?.comments || 0,
              reposts: serverReply?.reposts || 0,
              shares: serverReply?.shares || 0,
              threadBadge: hasMultipleThreads ? `${threadIndexNumber}/${totalCount}` : undefined,
              threadTotal: hasMultipleThreads ? totalCount : undefined,
              threadIndex: threadIndexNumber,
              threadId: hasMultipleThreads ? threadGroupId : undefined,
              hasConnector: hasMultipleThreads ? !isLast : false,
            };

            if (i === 0) {
              firstReply = finalReply;
            }
            createdReplies.push(finalReply);
            previousPostId = finalReply.id || replyToPost.id;
          }

          // Đồng bộ số lượng reply cho bài viết gốc và cập nhật Redux feed
          if (replyToPost?.id) {
            const rootPostId = replyToPost.parentId || replyToPost.id;
            const currentComments = getCachedCommentsCount(rootPostId) ?? replyToPost.comments ?? 0;
            const updatedComments = currentComments + validThreads.length;
            savePostCommentsCount(rootPostId, updatedComments);
            dispatch(
              updatePostInteraction({
                postId: rootPostId,
                updates: { comments: updatedComments },
              })
            );
          }

          onReplySuccess?.(createdReplies);

          window.dispatchEvent(
            new CustomEvent('app-toast', {
              detail: {
                type: 'reply',
                status: 'completed',
                message: 'Posted',
                replyId: firstReply?.id,
                actionLabel: 'View',
                onAction: () => {
                  const el = document.getElementById(`reply-item-${firstReply?.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('bg-zinc-100/80', 'dark:bg-zinc-800/50', 'transition-all');
                    setTimeout(
                      () => el.classList.remove('bg-zinc-100/80', 'dark:bg-zinc-800/50'),
                      1500
                    );
                  }
                },
              },
            })
          );
        } catch (err) {
          console.warn('Reply submit error:', err);
          const errData = err?.response?.data;
          let errMsg = 'Không thể đăng trả lời. Vui lòng thử lại.';
          if (errData?.errors && typeof errData.errors === 'object') {
            const firstKey = Object.keys(errData.errors)[0];
            const firstVal = errData.errors[firstKey];
            errMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
          } else if (errData?.message) {
            errMsg = errData.message;
          }
          window.dispatchEvent(
            new CustomEvent('app-toast', {
              detail: {
                message: errMsg,
              },
            })
          );
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      if (onSubmitPost) {
        await onSubmitPost({
          content: validThreads[0].content.trim(),
          mediaFiles: validThreads[0].mediaFiles || [],
          topic: selectedTopic || null,
          quotedPost: quotedPost || null,
          replyPermission,
          requiresReplyApproval,
        });
      } else {
        let firstPostId = null;

        for (let i = 0; i < validThreads.length; i++) {
          const tItem = validThreads[i];
          const formData = new FormData();
          const textContent = tItem.content.trim();
          formData.append('content', textContent || '.');

          (tItem.mediaFiles || []).forEach((file) => {
            formData.append('media[]', file);
          });

          formData.append('reply_permission', replyPermission || 'everyone');
          if (requiresReplyApproval) {
            formData.append('requires_reply_approval', '1');
          }

          if (selectedTopic && i === 0) {
            formData.append('topic_name', selectedTopic);
          }

          if (i === 0) {
            let response;
            if (quotedPost?.id) {
              response = await quotePostApi(quotedPost.id, formData);
            } else {
              response = await createPostApi(formData);
            }

            const postData = response?.data || response;
            const adapted = adaptPost(postData);

            if (adapted) {
              dispatch(prependFeedPost({ feedType, post: adapted }));
              firstPostId = adapted.id;
            }
          } else if (firstPostId) {
            await createReplyApi(firstPostId, formData);
          }
        }

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

      threads.forEach((t) => {
        t.mediaPreviews?.forEach((item) => {
          if (item?.url) URL.revokeObjectURL(item.url);
        });
      });
      setThreads([createEmptyThread()]);
      setSelectedTopic('');
      onClose();
    } catch (err) {
      console.error('Create post error:', err);
      const errData = err?.response?.data;
      let errMsg = 'Không thể đăng bài viết. Vui lòng thử lại.';
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
          },
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnyMediaError = threads.some((t) =>
    t.mediaPreviews?.some((p) => p.hasError)
  );

  const hasValidContent =
    !hasAnyMediaError &&
    threads.some(
      (t) => t.content.trim() || (t.mediaFiles && t.mediaFiles.length > 0) || t.imageUrl
    );

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

        {/* Tiêu đề New thread / Reply / Quote ở giữa */}
        <h2 className="text-base font-bold tracking-tight absolute left-1/2 -translate-x-1/2 text-white">
          {isReplyModal || replyToPost
            ? t('createPost.reply', 'Reply')
            : quotedPost
              ? t('createPost.quote', 'Quote')
              : t('createPost.newThread', 'New thread')}
        </h2>

        {/* Icon Bản nháp (Drafts) & Icon More (...) trong vòng tròn */}
        <div className="flex items-center gap-2.5">
          {!isReplyModal && !replyToPost && (
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
          )}

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
      <form
        onSubmit={handleSubmit}
        className="p-4 sm:p-5 flex flex-col space-y-3 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin scrollbar-thumb-zinc-700"
      >
        {/* Post được reply nếu có (Reply modal) */}
        {replyToPost && (
          <div className="flex gap-3 items-start select-none">
            <div className="flex flex-col items-center shrink-0 self-stretch">
              <img
                src={replyToPost.author?.avatar || getAuthorAvatar(replyToPost.author)}
                alt={replyToPost.author?.username || 'user'}
                className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
              />
              <div className="w-[1.5px] bg-zinc-800/90 flex-1 my-1.5 min-h-6" />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">
                  {replyToPost.author?.username || 'user'}
                </span>
                <span className="text-xs text-zinc-500">
                  {replyToPost.timestamp}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                {replyToPost.content}
                {showBadge && (
                  <span className="inline-flex items-center text-[11px] font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full select-none ml-2">
                    1/{totalCount}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Danh sách các bài trong chuỗi Threads */}
        {threads.map((threadItem, idx) => {
          const threadIndexNumber = (hasParent ? 1 : 0) + idx + 1;
          const isFirstItem = idx === 0;

          return (
            <div key={threadItem.id || idx} className="flex gap-3 items-start">
              {/* Cột Avatar và đường kết nối xuống dưới */}
              <div className="flex flex-col items-center shrink-0 self-stretch">
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
                />
                {/* Đường kết nối thread kéo dài xuống bài tiếp theo hoặc nút Add to thread */}
                <div className="w-[1.5px] bg-zinc-800/90 flex-1 my-1.5 min-h-10" />
              </div>

              {/* Cột Nội dung */}
              <div className="flex-1 min-w-0">
                {/* Header: Username & Topic Selector (nếu là bài đầu) & Badge [i/N] & Nút Xóa (X) */}
                <div className="flex items-center justify-between mb-1.5 relative">
                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span className="text-sm font-bold text-white hover:underline cursor-pointer">
                      {username}
                    </span>

                    {/* Chỉ bài đầu tiên mới có Topic Selector */}
                    {isFirstItem && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <button
                          type="button"
                          onClick={() => setShowTopicPicker((prev) => !prev)}
                          className="text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer truncate max-w-44"
                        >
                          {selectedTopic || 'Community or topic'}
                        </button>
                      </>
                    )}

                    {/* Badge đếm thread [i/N] */}
                    {showBadge && (
                      <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full select-none ml-1">
                        {threadIndexNumber}/{totalCount}
                      </span>
                    )}
                  </div>

                  {/* Nút Xóa bài viết khỏi chuỗi thread (từ bài thứ 2 trở đi) */}
                  {!isFirstItem && (
                    <button
                      type="button"
                      onClick={() => handleRemoveThread(idx)}
                      className="p-1 -mr-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      title="Xóa bài này khỏi chuỗi thread"
                      aria-label="Xóa bài này khỏi chuỗi thread"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>
                  )}

                  {/* Popover chọn Topic (cho bài đầu) */}
                  {isFirstItem && showTopicPicker && (
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
                  ref={(el) => (textareaRefs.current[idx] = el)}
                  value={threadItem.content}
                  onChange={(e) => handleUpdateThreadContent(idx, e.target.value)}
                  placeholder={isFirstItem ? placeholderText : 'Say more...'}
                  rows={2}
                  className="w-full bg-transparent resize-none text-[15px] placeholder-zinc-500 text-white focus:outline-none leading-relaxed"
                />

                {/* Hidden file input for uploading media files */}
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[idx] = el)}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleFilesSelect(idx, e)}
                />

                {/* Preview danh sách file đã chọn (mediaPreviews) */}
                {threadItem.mediaPreviews?.length > 0 && (
                  <div className="flex gap-2.5 mt-2.5 overflow-x-auto pb-2 scrollbar-none">
                    {threadItem.mediaPreviews.map((item, mIdx) => (
                      <div
                        key={mIdx}
                        className={`relative shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border ${
                          item.hasError
                            ? 'border-red-500 bg-red-950/40 ring-1 ring-red-500/60'
                            : 'border-zinc-800 bg-zinc-900'
                        } group`}
                      >
                        {item.type === 'video' ? (
                          <video
                            src={item.url}
                            className={`w-full h-full object-cover ${item.hasError ? 'opacity-25' : ''}`}
                            controls={false}
                            onError={() => handleMediaLoadError(idx, mIdx)}
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt="Upload preview"
                            className={`w-full h-full object-cover ${item.hasError ? 'opacity-25' : ''}`}
                            onError={() => handleMediaLoadError(idx, mIdx)}
                          />
                        )}
                        {item.hasError && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center pointer-events-none bg-black/40">
                            <AlertCircle className="w-7 h-7 text-red-500 mb-1 animate-pulse" />
                            <span className="text-xs font-bold text-red-300">
                              Tệp bị lỗi
                            </span>
                            <span className="text-[10px] text-red-400 mt-0.5">
                              Xóa để tiếp tục
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx, mIdx)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-white hover:bg-black transition-colors cursor-pointer shadow-md z-10"
                          title="Xóa tệp"
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Toolbar 9 icons chuẩn Threads */}
                <div className="flex items-center gap-3.5 mt-2 text-zinc-500">
                  {/* 1. Image / Video picker */}
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    className="hover:text-zinc-300 transition-colors cursor-pointer"
                    title="Add Image or Video"
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

                {/* Quoted Post Card (nếu đang ở chế độ Quote và là bài đầu tiên) */}
                {isFirstItem && quotedPost && (
                  <div className="mt-3">
                    <QuotedPostCard post={quotedPost} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Hàng: Avatar nhỏ + 'Add to thread' */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex flex-col items-center shrink-0 w-9">
            <img
              src={avatarUrl}
              alt={username}
              className="w-5 h-5 rounded-full object-cover border border-zinc-800 opacity-60"
            />
          </div>
          <button
            type="button"
            onClick={handleAddThread}
            className="text-[13px] text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer"
          >
            Add to thread
          </button>
        </div>

        {/* 3. Footer Options: [††] Post options & Nút Post */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between relative shrink-0">
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

          {/* Nút Post */}
          <button
            type="submit"
            disabled={!hasValidContent || hasAnyMediaError || isSubmitting}
            className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              hasValidContent && !isSubmitting
                ? 'bg-white text-black hover:opacity-90 active:scale-95 cursor-pointer shadow-sm'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              t('createPost.postBtn', 'Post')
            )}
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
