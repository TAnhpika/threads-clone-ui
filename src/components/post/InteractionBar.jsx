import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Send } from 'lucide-react';

export default function InteractionBar({
  initialLikes = 0,
  initialComments = 0,
  initialReposts = 0,
  initialShares = 0,
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [reposts, setReposts] = useState(initialReposts);
  const [isReposted, setIsReposted] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleRepost = () => {
    if (isReposted) {
      setReposts((prev) => prev - 1);
      setIsReposted(false);
    } else {
      setReposts((prev) => prev + 1);
      setIsReposted(true);
    }
  };

  // Hàm format số lượng hiển thị (1200 -> 1,2K)
  const formatCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return count.toLocaleString('vi-VN');
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 mt-3 -ml-2 text-zinc-600 dark:text-zinc-400">
      {/* 1. Like Button */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer group hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
          isLiked ? 'text-red-500' : 'hover:text-black dark:hover:text-white'
        }`}
        title="Thích"
      >
        <Heart
          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
            isLiked ? 'fill-red-500 stroke-red-500' : ''
          }`}
        />
        <span>{formatCount(likes)}</span>
      </button>

      {/* 2. Comment Button */}
      <button
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer group hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
        title="Bình luận"
      >
        <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span>{formatCount(initialComments)}</span>
      </button>

      {/* 3. Repost Button */}
      <button
        onClick={handleRepost}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer group hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
          isReposted ? 'text-green-500' : 'hover:text-black dark:hover:text-white'
        }`}
        title="Đăng lại"
      >
        <Repeat2
          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
            isReposted ? 'stroke-green-500 stroke-2' : ''
          }`}
        />
        <span>{formatCount(reposts)}</span>
      </button>

      {/* 4. Share Button */}
      <button
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer group hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
        title="Chia sẻ"
      >
        <Send className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span>{formatCount(initialShares)}</span>
      </button>
    </div>
  );
}
