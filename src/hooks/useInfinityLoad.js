import { useEffect, useRef } from "react";

/**
 * Hook lắng nghe khi phần tử sentinel chạm đáy màn hình để kích hoạt tải thêm dữ liệu
 */
export function useInfinityLoad({
    onIntersect,
    hasMore,
    isLoading,
    rootMargin = "1000px 0px",
    threshold = 0.01,
}) {
    const sentinelRef = useRef(null);

    useEffect(() => {
        const target = sentinelRef.current;
        if (!target || !hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onIntersect?.();
                }
            },
            { threshold, rootMargin },
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [onIntersect, hasMore, isLoading, rootMargin, threshold]);

    return { sentinelRef };
}
