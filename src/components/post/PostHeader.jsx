import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { MoreHorizontal, CheckCircle2, Plus, Check } from 'lucide-react';
import PostMenu from './PostMenu';
import PostHeaderModals from './PostHeaderModals';
import { useAuthorRelationship, usePostMenuActions } from '@/hooks';
import { getAuthorAvatar, defaultAvatar } from '@/utils/avatar';
import { getShareUrl } from '@/utils/postUrl';

/**
 * Component Header hiển thị thông tin tác giả, avatar, badge follow, thời gian và menu tác vụ bài viết.
 * Đã được tái cấu trúc phân tách logic sang `useAuthorRelationship`, `usePostMenuActions` và `PostHeaderModals`.
 */
export default function PostHeader({
  author = {},
  timestamp = '2h',
  tag,
  postId,
  showFollowBadge = true,
  onFollow,
  post,
}) {
  const { name = 'Anonymous', avatar, isVerified = false } = author;
  const shareUrl = getShareUrl({ author }, postId);

  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Hook quản lý quan hệ người dùng với tác giả (Follow / Mute / Restrict / Block)
  const {
    username,
    isOwnPost,
    shouldRenderFollow,
    isFollowed,
    isMuted,
    isRestricted,
    isBlocked,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isUnfollowModalOpen,
    setIsUnfollowModalOpen,
    isBlockModalOpen,
    setIsBlockModalOpen,
    handleFollowClick,
    handleFollowingBadgeClick,
    handleOpenUnfollow,
    handleConfirmUnfollow,
    handleConfirmBlock,
  } = useAuthorRelationship({
    author,
    post,
    currentUser,
    isAuthenticated,
    showFollowBadge,
    onFollow,
  });

  // Hook quản lý các hành động menu bài viết (Save, Pin, Archive, Delete, Embed...)
  const {
    isMenuOpen,
    setIsMenuOpen,
    isEmbedModalOpen,
    setIsEmbedModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    isSaved,
    isPinned,
    isArchived,
    isHideLikes,
    handleAction,
    handleConfirmDelete,
  } = usePostMenuActions({
    post,
    postId,
    author,
    isOwnPost,
    shareUrl,
    currentUser,
    isAuthenticated,
    onOpenBlockModal: () => setIsBlockModalOpen(true),
  });

  return (
    <div
      className="flex items-center justify-between gap-3 relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Thông tin tác giả & thời gian */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={avatar || getAuthorAvatar(author)}
            alt={name}
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
            className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
            loading="lazy"
          />
          {shouldRenderFollow &&
            (isFollowed ? (
              // Badge [✓] khi ĐÃ THEO DÕI -> click mở Profile Modal
              <button
                type="button"
                onClick={handleFollowingBadgeClick}
                title="Following"
                aria-label={`Following @${username}`}
                className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-white dark:bg-white text-black dark:text-black border-2 border-white dark:border-[#121212] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-xs z-10"
              >
                <Check className="w-3.5 h-3.5 stroke-3" />
              </button>
            ) : (
              // Badge [+] khi CHƯA THEO DÕI -> click thực hiện Follow
              <button
                type="button"
                onClick={handleFollowClick}
                title="Follow"
                aria-label={`Follow @${username}`}
                className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-[#121212] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-xs z-10"
              >
                <Plus className="w-3.5 h-3.5 stroke-3" />
              </button>
            ))}
        </div>

        {/* Tên, Verified & Thời gian */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="font-bold text-sm text-black dark:text-white hover:underline cursor-pointer truncate">
            {username}
          </span>

          {isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
          )}

          {tag && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0">
              <span>›</span>
              <span className="font-medium hover:underline cursor-pointer">{tag}</span>
            </span>
          )}

          <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
            · {timestamp}
          </span>
        </div>
      </div>

      {/* Nút tùy chọn More (...) & Menu Modal */}
      <div className="relative shrink-0">
        <PostMenu
          trigger={
            <button
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                  : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Tùy chọn"
              aria-label="Tùy chọn bài viết"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          }
          isOpen={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onAction={handleAction}
          postUrl={shareUrl}
          isOwnPost={isOwnPost}
          createdAt={post?.createdAt || post?.raw?.created_at || post?.created_at}
          timestamp={timestamp || post?.timestamp}
          isSaved={isSaved}
          isMuted={isMuted}
          isRestricted={isRestricted}
          isBlocked={isBlocked}
          isPinned={isPinned}
          isArchived={isArchived}
          isHideLikes={isHideLikes}
        />
      </div>

      {/* 7 Modals liên quan đến Profile, Block, Xoá, Chỉnh sửa, Nhúng và Báo cáo */}
      <PostHeaderModals
        author={author}
        post={post}
        postId={postId}
        currentUser={currentUser}
        timestamp={timestamp}
        tag={tag}
        isProfileModalOpen={isProfileModalOpen}
        setIsProfileModalOpen={setIsProfileModalOpen}
        onOpenUnfollow={handleOpenUnfollow}
        isUnfollowModalOpen={isUnfollowModalOpen}
        setIsUnfollowModalOpen={setIsUnfollowModalOpen}
        handleConfirmUnfollow={handleConfirmUnfollow}
        isBlockModalOpen={isBlockModalOpen}
        setIsBlockModalOpen={setIsBlockModalOpen}
        handleConfirmBlock={handleConfirmBlock}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        handleConfirmDelete={handleConfirmDelete}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        isEmbedModalOpen={isEmbedModalOpen}
        setIsEmbedModalOpen={setIsEmbedModalOpen}
        isReportModalOpen={isReportModalOpen}
        setIsReportModalOpen={setIsReportModalOpen}
      />
    </div>
  );
}
