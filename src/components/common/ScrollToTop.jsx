import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Tự động đưa vị trí cuộn trang về đỉnh (top: 0) mỗi khi chuyển trang (pathname hoặc search query thay đổi)
 */
export default function ScrollToTop({ behavior = 'instant' }) {
  const { pathname, search } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior,
      });
    } catch {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search, behavior]);

  return null;
}
