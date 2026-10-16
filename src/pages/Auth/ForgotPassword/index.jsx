import { useState } from "react";
import { Link } from "react-router-dom";
import threadsLoginBg from "@/assets/images/threads-login-bg.webp";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Vui lòng nhập địa chỉ email của bạn");
      return;
    }
    setIsSubmitted(true);
    showToast("Đã gửi hướng dẫn khôi phục mật khẩu vào email của bạn!");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-white dark:bg-[#0a0a0a] text-black dark:text-white overflow-hidden select-none px-4 py-6 transition-colors duration-200">
      {/* Background Threads */}
      <div className="absolute top-0 -mt-67 left-1/2 -translate-x-1/2 w-446.25 h-127.5 max-w-none pointer-events-none select-none z-0">
        <picture className="w-446.25 h-127.5 block">
          <source
            srcSet="https://static.cdninstagram.com/rsrc.php/ym/r/gf40BP6SRYU.avif"
            type="image/avif"
          />
          <source
            srcSet="https://static.cdninstagram.com/rsrc.php/yL/r/ZqRe_VCVa2A.webp"
            type="image/webp"
          />
          <img
            alt=""
            height="510"
            width="1785"
            src={threadsLoginBg}
            className="w-446.25 h-127.5 max-w-none object-contain pointer-events-none select-none"
          />
        </picture>
      </div>

      {/* Main Box */}
      <div className="w-full max-w-92.5 z-20 flex flex-col items-center pt-24 sm:pt-28 my-auto">
        <h1 className="text-base sm:text-lg font-bold text-black dark:text-white text-center mb-2 tracking-tight">
          Khôi phục mật khẩu
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-6 leading-relaxed">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu tài khoản Threads.
        </p>

        {isSubmitted ? (
          <div className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <p className="text-sm font-semibold text-black dark:text-white">
              Đã gửi email khôi phục!
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Vui lòng kiểm tra hộp thư đến của <span className="font-semibold text-black dark:text-white">{email}</span> để tiếp tục.
            </p>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-zinc-500 hover:text-black dark:hover:text-white underline cursor-pointer"
            >
              Gửi lại email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email..."
                className="w-full h-13 px-4.5 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full h-13 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm active:scale-99 transition-all cursor-pointer flex items-center justify-center shadow-lg"
            >
              Gửi liên kết
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            ← Quay lại Đăng nhập
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full z-20 pt-8 pb-2">
        <div className="flex items-center justify-center gap-3.5 text-xs text-zinc-400 dark:text-zinc-600 font-normal flex-wrap">
          <span>© 2026</span>
          <Link to="/login" className="hover:underline">Threads Terms</Link>
          <Link to="/login" className="hover:underline">Privacy Policy</Link>
        </div>
      </footer>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4.5 py-2.5 bg-black/95 dark:bg-white text-white dark:text-black border border-zinc-800/80 dark:border-zinc-200 rounded-2xl text-xs font-semibold shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
