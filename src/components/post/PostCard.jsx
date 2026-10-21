import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveFeedScroll } from "@/features/feed/feedSlice";
import { getCachedCommentsCount } from "@/services/postService";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import QuotedPostCard from "./QuotedPostCard";
import InteractionBar from "./InteractionBar";
import PostNoticeCard from "./PostNoticeCard";
import { usePostModeration } from "@/hooks";

/**
 * Component hiển thị thẻ bài viết hoàn chỉnh trên Feed hoặc trang chi tiết.
 * Đã được tách logic kiểm duyệt (ẩn, tắt tiếng, chặn) sang hook `usePostModeration`.
 */
export default function PostCard({
  post,
  feedType = "for_you",
  isDetail = false,
  showFollowBadge = true,
  onCommentClick,
  onQuote,
  className = "",
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Hook quản lý trạng thái bài viết bị ẩn, tắt tiếng, chặn kèm hàm hoàn tác
  const { noticeMessage, handleUndoNotice } = usePostModeration({ post });

  if (!post) return null;

  // Hiển thị card thông báo thay thế khi bài viết bị ẩn / tác giả bị tắt tiếng hoặc chặn
  if (noticeMessage) {
    return (
      <PostNoticeCard
        postId={post.id}
        message={noticeMessage}
        onUndo={handleUndoNotice}
        isDetail={isDetail}
        className={className}
      />
    );
  }

  // Điều hướng vào trang chi tiết bài viết khi click vào thẻ (trừ các nút tương tác)
  const handlePostClick = (e) => {
    if (isDetail) return;
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest("input") ||
      e.target.closest("textarea") ||
      e.target.closest('[role="dialog"]') ||
      e.target.closest('[role="menu"]') ||
      e.target.closest(".fixed")
    ) {
      return;
    }
    const currentScrollY =
      window.scrollY || document.documentElement.scrollTop || 0;
    dispatch(
      saveFeedScroll({
        feedType,
        scrollPosition: currentScrollY,
        lastClickedPostId: post.id,
      })
    );
    navigate(`/@${post.author?.username || "user"}/post/${post.id}`);
  };

  return (
    <article
      id={`post-card-${post.id}`}
      data-post-id={post.id}
      onClick={handlePostClick}
      className={`py-4 px-4 sm:px-5 ${
        isDetail
          ? "cursor-default"
          : "border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors cursor-pointer"
      } ${className}`}
    >
      {/* 1. Header tác giả & thời gian */}
      <PostHeader
        author={post.author}
        timestamp={post.timestamp}
        tag={post.tag}
        postId={post.id}
        showFollowBadge={showFollowBadge}
        post={post}
      />

      {/* 2. Nội dung bài viết (Text + Media) */}
      <div className={isDetail ? "mt-3" : "pl-13"}>
        <PostContent
          text={post.content}
          media={post.media}
          threadBadge={post.threadBadge}
        />

        {/* 2.1. Card bài viết trích dẫn (nếu có) */}
        {post.quotedPost && (
          <div className="mt-2.5">
            <QuotedPostCard post={post.quotedPost} />
          </div>
        )}

        {/* 3. Thanh tương tác (Like, Comment, Repost, Share) */}
        <div className="mt-2.5">
          <InteractionBar
            post={post}
            postId={post.id}
            authorUsername={post.author?.username}
            feedType={feedType}
            initialLikes={post.likes}
            initialComments={Math.max(
              post.comments || 0,
              getCachedCommentsCount(post.id) || 0
            )}
            initialReposts={post.reposts}
            initialShares={post.shares}
            initialIsLiked={post.isLiked}
            initialIsReposted={post.isReposted}
            onCommentClick={onCommentClick}
            onQuote={onQuote}
          />
        </div>
      </div>
    </article>
  );
}
