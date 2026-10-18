import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { saveFeedScroll } from '@/features/feed/feedSlice';
import PostHeader from '@/components/post/PostHeader';
import PostContent from '@/components/post/PostContent';
import QuotedPostCard from '@/components/post/QuotedPostCard';
import InteractionBar from '@/components/post/InteractionBar';

export default function PostCard({
  post,
  feedType = 'for_you',
  isDetail = false,
  showFollowBadge = true,
  onCommentClick,
  onQuote,
  className = '',
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  if (!post) return null;

  const handlePostClick = (e) => {
    if (isDetail) return;
    // Không chuyển trang nếu bấm vào nút tương tác, avatar, menu
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    dispatch(
      saveFeedScroll({
        feedType,
        scrollPosition: currentScrollY,
        lastClickedPostId: post.id,
      })
    );
    navigate(`/@${post.author?.username || 'user'}/post/${post.id}`);
  };

  return (
    <article
      id={`post-card-${post.id}`}
      data-post-id={post.id}
      onClick={handlePostClick}
      className={`py-4 px-4 sm:px-5 ${
        isDetail
          ? 'cursor-default'
          : 'border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors cursor-pointer'
      } ${className}`}
    >
      {/* 1. Header tác giả & thời gian */}
      <PostHeader
        author={post.author}
        timestamp={post.timestamp}
        tag={post.tag}
        postId={post.id}
        showFollowBadge={showFollowBadge}
      />

      {/* 2. Nội dung bài viết (Text + Media) */}
      <div className={isDetail ? 'mt-3' : 'pl-13'}>
        <PostContent
          text={post.content}
          media={post.media}
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
            initialComments={post.comments}
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
