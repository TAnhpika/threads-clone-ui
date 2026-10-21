/**
 * Module tiện ích hiển thị Toast Notification toàn ứng dụng phong cách Threads
 * Tích hợp trực tiếp với GlobalToast thông qua CustomEvent 'app-toast'
 */

/**
 * Hiển thị thông báo Toast trên toàn ứng dụng
 * @param {string|object} messageOrOptions - Nội dung thông báo dạng chuỗi hoặc object cấu hình
 */
export function showToast(messageOrOptions) {
  if (typeof window === "undefined") return;

  const detail =
    typeof messageOrOptions === "string"
      ? { message: messageOrOptions }
      : messageOrOptions || {};

  window.dispatchEvent(new CustomEvent("app-toast", { detail }));
}

/**
 * Hiển thị thông báo Toast thành công
 */
export function showSuccessToast(message, options = {}) {
  showToast({
    message,
    type: "default",
    ...options,
  });
}

/**
 * Hiển thị thông báo Toast lỗi
 */
export function showErrorToast(message, options = {}) {
  showToast({
    message,
    type: "default",
    ...options,
  });
}

/**
 * Hiển thị thông báo Toast có nút Hoàn tác (Undo)
 */
export function showUndoToast(message, onUndo, undoText = "Hoàn tác", options = {}) {
  showToast({
    message,
    undoText,
    onUndo,
    ...options,
  });
}

/**
 * Hiển thị thông báo Toast có nút hành động (ví dụ: View post)
 */
export function showActionToast(message, onAction, actionLabel = "View", options = {}) {
  showToast({
    message,
    actionLabel,
    onAction,
    ...options,
  });
}

/**
 * React Hook useToast để sử dụng tiện lợi trong component
 */
export function useToast() {
  return {
    showToast,
    showSuccessToast,
    showErrorToast,
    showUndoToast,
    showActionToast,
  };
}

export default showToast;
