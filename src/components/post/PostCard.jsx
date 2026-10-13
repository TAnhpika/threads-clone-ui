import PostHeader from '@/components/post/PostHeader';
import PostContent from '@/components/post/PostContent';
import InteractionBar from '@/components/post/InteractionBar';

export default function PostCard({ post }) {
  if (!post) return null;

  return (
    <article className="py-4 px-4 sm:px-5 border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors">
      {/* 1. Header tác giả & thời gian */}
      <PostHeader
        author={post.author}
        timestamp={post.timestamp}
        tag={post.tag}
      />

      {/* 2. Nội dung bài viết (Text + Media) */}
      <div className="pl-13">
        <PostContent
          text={post.content}
          media={post.media}
        />

        {/* 3. Thanh tương tác (Like, Comment, Repost, Share) */}
        <InteractionBar
          initialLikes={post.likes}
          initialComments={post.comments}
          initialReposts={post.reposts}
          initialShares={post.shares}
        />
      </div>
    </article>
  );
}
