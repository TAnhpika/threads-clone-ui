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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4.5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs sm:text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-3 border border-zinc-800/80 dark:border-zinc-200/80 select-none max-w-[92vw]"
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
          className="underline hover:opacity-80 font-bold cursor-pointer text-blue-400 dark:text-blue-600 shrink-0"
        >
          {toast.undoText}
        </button>
      )}
    </div>
  );
}
