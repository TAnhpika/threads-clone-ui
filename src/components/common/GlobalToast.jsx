import { useState, useEffect, useRef } from 'react';

/**
 * GlobalToast component hiển thị thông báo toast / pop-up hoàn tác trên toàn ứng dụng.
 * Lắng nghe CustomEvent 'app-toast' từ bất kỳ component nào.
 */
export default function GlobalToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleToast = (e) => {
      const detail = e?.detail;
      if (!detail) return;

      const message = typeof detail === 'string' ? detail : detail.message;
      const undoText = detail.undoText || 'Hoàn tác';
      const onUndo = typeof detail.onUndo === 'function' ? detail.onUndo : null;
      const duration = detail.duration || (onUndo ? 5000 : 3000);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({
        id: Date.now(),
        message,
        undoText,
        onUndo,
      });

      timerRef.current = setTimeout(() => {
        setToast(null);
      }, duration);
    };

    window.addEventListener('app-toast', handleToast);
    return () => {
      window.removeEventListener('app-toast', handleToast);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      id="app-global-toast"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 bg-white text-black dark:bg-white dark:text-black rounded-2xl text-sm font-semibold shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150 flex items-center justify-center gap-3 select-none min-w-28 text-center"
    >
      <span className="truncate">{toast.message}</span>
      {toast.onUndo && (
        <button
          type="button"
          onClick={() => {
            const undoFn = toast.onUndo;
            setToast(null);
            if (timerRef.current) clearTimeout(timerRef.current);
            undoFn();
          }}
          className="underline hover:opacity-80 font-bold cursor-pointer text-blue-500 shrink-0"
        >
          {toast.undoText}
        </button>
      )}
    </div>
  );
}
