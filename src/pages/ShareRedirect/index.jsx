import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostByIdApi } from '@/services/postService';

/**
 * Trang xử lý chuyển hướng Share Link ngắn (/share/:postId)
 * Tự động tra cứu bài viết và chuyển hướng người dùng sang đường dẫn chi tiết bài viết:
 * /@:username/post/:postId
 */
export default function ShareRedirectPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!postId) {
      navigate('/', { replace: true });
      return;
    }

    let isMounted = true;

    getPostByIdApi(postId)
      .then((post) => {
        if (!isMounted) return;
        const authorUsername = post?.author?.username || post?.user?.username || 'user';
        const targetId = post?.id || postId;
        window.history.replaceState(null, '', '/');
        navigate(`/@${authorUsername}/post/${targetId}`, {
          replace: false,
          state: { fromShare: true },
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        console.warn('Share redirect error, falling back to /post/:postId:', error);
        window.history.replaceState(null, '', '/');
        navigate(`/post/${postId}`, {
          replace: false,
          state: { fromShare: true },
        });
      });

    return () => {
      isMounted = false;
    };
  }, [postId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 select-none">
      <div className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-black dark:border-t-white rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Đang mở bài viết...
      </p>
    </div>
  );
}
