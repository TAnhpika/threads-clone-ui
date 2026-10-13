import FeedHeader from '@/components/FeedHeader';
import PostCard from '@/components/post/PostCard';
import LoginPanel from '@/components/LoginPanel';
import { mockPosts } from '@/components/post/mockPosts';

export default function HomePage() {
  return (
    <div className="flex justify-center items-start gap-6 w-full">
      {/* Cột giữa: Feed chính chứa FeedHeader & danh sách PostCard */}
      <section className="flex-1 max-w-[640px] min-w-0 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden transition-colors">
        {/* Header của Feed với tiêu đề "Trang chủ" */}
        <FeedHeader title="Trang chủ" />

        {/* Danh sách các bài viết */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Cột phải: LoginPanel mời đăng nhập */}
      <LoginPanel />
    </div>
  );
}
