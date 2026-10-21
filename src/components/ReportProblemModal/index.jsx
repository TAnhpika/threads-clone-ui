import { useState, useEffect, useRef, useCallback } from 'react';
import { Paperclip, X, Check, Loader2 } from 'lucide-react';

export default function ReportProblemModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [details, setDetails] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const cardRef = useRef(null);

  // Lắng nghe sự kiện custom toàn ứng dụng 'open-report-problem'
  useEffect(() => {
    const handleOpen = () => {
      setInternalIsOpen(true);
      setIsSuccess(false);
    };
    window.addEventListener('open-report-problem', handleOpen);
    return () => window.removeEventListener('open-report-problem', handleOpen);
  }, []);

  const handleClose = useCallback(() => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    // Dọn dẹp state sau animation
    setTimeout(() => {
      setDetails('');
      setAttachedFiles([]);
      setIsSubmitting(false);
      setIsSuccess(false);
    }, 200);
  }, [isControlled, controlledOnClose]);

  // Khóa scroll body khi modal mở & xử lý phím Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus vào textarea khi mở
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      file,
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    // Reset file input value để có thể chọn lại file cùng tên nếu muốn
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => {
      const target = prev[index];
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!details.trim() && attachedFiles.length === 0) return;

    setIsSubmitting(true);
    // Giả lập gửi báo cáo phản hồi
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
    }, 600);
  };

  if (!isOpen) return null;

  const canSubmit = details.trim().length > 0 || attachedFiles.length > 0;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-problem-title"
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-122.5 flex flex-col items-center animate-in zoom-in-95 duration-150"
      >
        {/* TIÊU ĐỀ: CĂN GIỮA PHÍA TRÊN CARD */}
        <h2
          id="report-problem-title"
          className="text-white text-base sm:text-[17px] font-bold mb-4.5 tracking-tight text-center"
        >
          Report a problem
        </h2>

        {/* KHUNG THẺ CHÍNH (CARD) */}
        <div className="w-full bg-[#181818] border border-[#2e2e2e] rounded-5.5 p-4.5 sm:p-5 flex flex-col justify-between shadow-2xl transition-all">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-in zoom-in duration-200">
                <Check className="w-6 h-6 stroke-2.5" />
              </div>
              <p className="text-white font-semibold text-base">Thank you for your feedback</p>
              <p className="text-zinc-400 text-xs max-w-xs">
                Your report has been sent to help improve Threads.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              {/* VÙNG NHẬP TEXTAREA */}
              <textarea
                ref={textareaRef}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please include as many details as possible..."
                rows={5}
                className="w-full bg-transparent border-0 outline-none resize-none text-[15px] text-white placeholder:text-[#6e6e6e] leading-relaxed min-h-33.75 selection:bg-zinc-700"
              />

              {/* DANH SÁCH FILE ĐÍNH KÈM (NẾU CÓ) */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 pt-2.5 border-t border-[#262626]">
                  {attachedFiles.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative group bg-[#222222] border border-[#333333] rounded-xl p-1.5 flex items-center gap-2 max-w-45 text-xs text-zinc-300"
                    >
                      {item.preview ? (
                        <img
                          src={item.preview}
                          alt=""
                          className="w-7 h-7 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <Paperclip className="w-4 h-4 shrink-0 text-zinc-400" />
                      )}
                      <span className="truncate">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-zinc-400 hover:text-white p-0.5 rounded-full hover:bg-zinc-700/80 transition-colors ml-auto cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* THANH CÔNG CỤ DƯỚI CÙNG (BOTTOM BAR) */}
              <div className="flex items-center justify-between pt-2">
                {/* Nút đính kèm tệp Paperclip */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-[#888888] hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-[#252525]"
                  title="Attach file or screenshot"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-5 h-5 -rotate-45 stroke-2.2" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Nút Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={`px-4.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    canSubmit && !isSubmitting
                      ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-md active:scale-95'
                      : 'bg-[#202020] text-[#6e6e6e] border border-[#333333] cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
