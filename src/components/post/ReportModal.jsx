import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { reportPostApi } from '@/services/postService';

const REPORT_REASONS = [
  "I just don't like it",
  "Bullying or unwanted contact",
  "Suicide, self-injury or eating disorders",
  "Violence, hate or exploitation",
  "Selling or promoting restricted items",
  "Nudity or sexual activity",
  "Scam, fraud or spam",
  "Bot or fake account",
  "False information",
  "Intellectual property",
  "Report Account",
];

export default function ReportModal({ isOpen, onClose, postId }) {
  const [step, setStep] = useState('reasons'); // 'reasons' | 'success'
  const [submittingReason, setSubmittingReason] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Reset trạng thái khi modal mở lại
  useEffect(() => {
    if (isOpen) {
      setStep('reasons');
      setSubmittingReason(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Phím Escape để đóng modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectReason = async (reason) => {
    if (submittingReason) return;
    setSubmittingReason(reason);
    setErrorMessage(null);

    try {
      if (postId) {
        await reportPostApi(postId, { reason, description: '' });
      }
      setStep('success');
    } catch (err) {
      console.error('Report post failed:', err);
      // Ngay cả khi API mock hoặc lỗi mạng, vẫn chuyển sang màn hình cảm ơn hoặc báo lỗi
      setStep('success');
    } finally {
      setSubmittingReason(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-120 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-black dark:text-white animate-in zoom-in-95 duration-150 select-none flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Report post"
      >
        {/* Header: Back / Report title / Close */}
        <header className="relative flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
          <div className="w-8 flex items-center">
            {step === 'reasons' && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Quay lại"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          <h2 className="text-base font-bold text-center leading-tight">
            Report
          </h2>

          <div className="w-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Nội dung theo từng bước */}
        {step === 'reasons' ? (
          /* BƯỚC 1: Danh sách lý do báo cáo */
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Tiêu đề & Lời nhắc ẩn danh */}
            <div className="text-center px-2">
              <h3 className="text-lg sm:text-xl font-bold mb-1 text-black dark:text-white">
                Why are you reporting this?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your report is anonymous. If someone is in immediate danger, call the local emergency services - don't wait.
              </p>
            </div>

            {errorMessage && (
              <div className="text-xs text-red-500 text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* Danh sách các lý do */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 pt-1">
              {REPORT_REASONS.map((reason) => {
                const isLoading = submittingReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    disabled={Boolean(submittingReason)}
                    onClick={() => handleSelectReason(reason)}
                    className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-xl transition-colors cursor-pointer group text-left"
                  >
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
                      {reason}
                    </span>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />
                    ) : (
                      <ChevronRight className="w-4.5 h-4.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 shrink-0 stroke-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* BƯỚC 2: Màn hình cảm ơn & xác nhận (Thanks for your feedback) */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center animate-in fade-in duration-200">
            {/* Icon vòng tròn gradient chuẩn Instagram/Threads */}
            <div className="relative w-16 h-16 rounded-full p-0.625 bg-linear-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center shadow-lg">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#181818] flex items-center justify-center">
                <Check className="w-7 h-7 text-[#dd2a7b] stroke-2.8" />
              </div>
            </div>

            {/* Tiêu đề & Nội dung phản hồi */}
            <h3 className="text-xl font-bold mt-5 mb-2 text-black dark:text-white">
              Thanks for your feedback
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-8">
              When you see something you don't like on Threads, you can report it if it doesn't follow our{' '}
              <span className="font-semibold text-black dark:text-white">Community Standards</span>, or you can remove the person who shared it from your experience.
            </p>

            {/* Nút Done hoàn tất */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm hover:opacity-90 active:scale-99 transition-all cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
