/**
 * Component hiển thị banner thông báo thay thế nội dung bài viết
 * Sử dụng chung cho:
 * 1. Hide post (Not interested): "This post has been hidden."
 * 2. Mute user: "Posts from {username} are muted. You can manage who you mute in settings."
 */
export default function PostNoticeCard({
  postId,
  message,
  onUndo,
  undoText = 'Undo',
  isDetail = false,
  className = '',
}) {
  return (
    <article
      id={`post-card-${postId}`}
      data-post-id={postId}
      className={`py-3 px-4 sm:px-5 ${
        isDetail ? '' : 'border-b border-zinc-100 dark:border-zinc-800/80'
      } ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3.5 bg-zinc-100 dark:bg-[#181818] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl text-sm transition-colors select-none">
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">
          {message}
        </span>
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="text-black dark:text-white font-semibold text-sm hover:underline cursor-pointer ml-3 shrink-0"
          >
            {undoText}
          </button>
        )}
      </div>
    </article>
  );
}
