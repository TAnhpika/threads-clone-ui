import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

/**
 * GlobalToast component hiển thị thông báo toast / pop-up hoàn tác trên toàn ứng dụng.
 * Lắng nghe CustomEvent 'app-toast' từ bất kỳ component nào.
 */
export default function GlobalToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleToast = (e) => {
      const detail = e?.detail;
      if (!detail) return;

      const message = typeof detail === 'string' ? detail : detail.message;
      const undoText = detail.undoText || 'Hoàn tác';
      const onUndo = typeof detail.onUndo === 'function' ? detail.onUndo : null;
      const type = detail.type || 'default';
      const status = detail.status || 'default';
      const postId = detail.postId;
      const authorUsername = detail.authorUsername;
      const actionLabel = detail.actionLabel || 'View';
      const onAction = typeof detail.onAction === 'function' ? detail.onAction : null;
      const duration =
        detail.duration ||
        (status === 'loading' ? 15000 : onUndo ? 5000 : 3500);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({
        id: Date.now(),
        type,
        status,
        message,
        postId,
        authorUsername,
        actionLabel,
        onAction,
        undoText,
        onUndo,
      });

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          setToast(null);
        }, duration);
      }
    };

    window.addEventListener('app-toast', handleToast);
    return () => {
      window.removeEventListener('app-toast', handleToast);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!toast) return null;

  const handleViewPost = () => {
    if (toast.onAction) {
      toast.onAction();
    } else if (toast.postId) {
      const el = document.getElementById(`post-card-${toast.postId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-white/40', 'transition-all');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-white/40');
        }, 1500);
      } else if (toast.authorUsername) {
        navigate(`/@${toast.authorUsername}/post/${toast.postId}`);
      } else {
        navigate(`/post/${toast.postId}`);
      }
    }
    setToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Toast dạng Edit (Chuẩn Threads theo ảnh mẫu)
  if (toast.type === 'edit') {
    return (
      <div
        role="status"
        aria-live="polite"
        id="app-global-toast"
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-[280px] sm:w-[320px] px-5 py-3.5 bg-white text-black dark:bg-white dark:text-black rounded-2xl text-[15px] shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150 select-none"
      >
        {toast.status === 'loading' ? (
          /* Trạng thái 1: Editing... (Ảnh mẫu 1) */
          <div className="text-left font-medium text-black">
            {toast.message || 'Editing...'}
          </div>
        ) : (
          /* Trạng thái 2: ✓ Edited  View (Ảnh mẫu 2) */
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[2.8] text-black" />
              <span className="font-medium text-black">
                {toast.message || 'Edited'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleViewPost}
              className="font-semibold text-black hover:opacity-70 transition-opacity cursor-pointer text-[15px]"
            >
              {toast.actionLabel || 'View'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Toast tiêu chuẩn chung
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

