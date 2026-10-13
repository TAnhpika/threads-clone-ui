import { useState, useEffect } from "react";

/**
 * Hook làm trễ giá trị thay đổi liên tục (dùng cho ô tìm kiếm, auto-save, async validation)
 */
export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
