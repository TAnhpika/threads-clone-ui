import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { loginSuccess } from "@/features/auth/authSlice";
import userAvatar from "@/assets/images/ava.png";
import threadsLoginBg from "@/assets/images/threads-login-bg.webp";

// SVG Biểu tượng Instagram chuẩn với gradient rực rỡ
function InstagramGlyph({ className = "w-5 h-5 text-white" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// SVG QR Code chuẩn Threads
function ThreadsQRCode() {
  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24 text-white fill-current">
      {/* 3 Khối định vị góc (Positioning markers) */}
      <rect x="10" y="10" width="30" height="30" rx="8" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="19" y="19" width="12" height="12" rx="4" fill="currentColor" />
      <rect x="80" y="10" width="30" height="30" rx="8" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="89" y="19" width="12" height="12" rx="4" fill="currentColor" />
      <rect x="10" y="80" width="30" height="30" rx="8" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="19" y="89" width="12" height="12" rx="4" fill="currentColor" />

      {/* Các điểm dữ liệu QR tinh tế */}
      <circle cx="50" cy="20" r="3.5" />
      <circle cx="62" cy="20" r="3.5" />
      <circle cx="70" cy="20" r="3.5" />
      <circle cx="50" cy="32" r="3.5" />
      <circle cx="65" cy="32" r="3.5" />
      
      <circle cx="20" cy="50" r="3.5" />
      <circle cx="32" cy="50" r="3.5" />
      <circle cx="20" cy="65" r="3.5" />
      <circle cx="32" cy="65" r="3.5" />

      {/* Logo Threads @ ở trung tâm */}
      <circle cx="60" cy="60" r="14" fill="#141414" stroke="currentColor" strokeWidth="3" />
      <path
        d="M60 52c-4.4 0-8 3.6-8 8s3.6 8 8 8c3.2 0 5.8-1.8 7-4.4l-2.6-1.5c-.8 1.8-2.6 3-4.4 3-2.8 0-5.1-2.3-5.1-5.1s2.3-5.1 5.1-5.1c2.1 0 3.7 1.2 4.5 2.9l2.7-1.4C66.1 53.6 63.3 52 60 52z"
        fill="currentColor"
      />

      <circle cx="85" cy="50" r="3.5" />
      <circle cx="98" cy="50" r="3.5" />
      <circle cx="85" cy="65" r="3.5" />
      <circle cx="102" cy="65" r="3.5" />

      <circle cx="50" cy="85" r="3.5" />
      <circle cx="65" cy="85" r="3.5" />
      <circle cx="80" cy="85" r="3.5" />
      <circle cx="95" cy="85" r="3.5" />
      <circle cx="50" cy="98" r="3.5" />
      <circle cx="65" cy="98" r="3.5" />
      <circle cx="80" cy="98" r="3.5" />
      <circle cx="95" cy="98" r="3.5" />
    </svg>
  );
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const continueUrl = searchParams.get("continue") || "/profile";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const executeLogin = (userData) => {
    dispatch(
      loginSuccess({
        user: {
          id: "1",
          name: userData?.name || "Tuan Anh",
          username: userData?.username || "tuananhpika",
          email: userData?.email || "tuananhpika@threads.net",
          avatar: userAvatar,
        },
        accessToken: "threads_access_token_" + Date.now(),
        refreshToken: "threads_refresh_token_" + Date.now(),
      })
    );
    navigate(decodeURIComponent(continueUrl), { replace: true });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast("Vui lòng nhập Username, phone hoặc email");
      return;
    }
    executeLogin({
      username: identifier.trim(),
      email: identifier.includes("@") ? identifier.trim() : "tuananhpika@threads.net",
    });
  };

  const handleInstagramLogin = () => {
    executeLogin({
      name: "Tuan Anh",
      username: "tuananhpika",
      email: "tuananhpika@threads.net",
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[#0a0a0a] text-white overflow-hidden select-none px-4 py-6">
      {/* 1. HỌA TIẾT BACKGROUND CHUẨN THREADS (Canonical classes: w-446.25, h-127.5, -mt-67) */}
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

      {/* 2. KHUNG FORM ĐĂNG NHẬP CHÍNH */}
      <div className="w-full max-w-92.5 z-20 flex flex-col items-center pt-24 sm:pt-28 md:pt-32 my-auto">
        {/* Tiêu đề */}
        <h1 className="text-sm sm:text-base font-bold text-white text-center mb-4 tracking-tight">
          Log in with your Instagram account
        </h1>

        <form onSubmit={handleFormSubmit} className="w-full space-y-2.5">
          {/* Input Identifier */}
          <div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username, phone or email"
              className="w-full h-13.5 px-4.5 rounded-2xl bg-[#141414] border border-zinc-800 text-white placeholder:text-zinc-500 text-sm outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* Input Password */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-13.5 px-4.5 rounded-2xl bg-[#141414] border border-zinc-800 text-white placeholder:text-zinc-500 text-sm outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* Nút Log in */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full h-13.5 rounded-2xl bg-white text-black font-bold text-sm sm:text-base hover:bg-zinc-200 active:scale-99 transition-all cursor-pointer flex items-center justify-center shadow-lg"
            >
              Log in
            </button>
          </div>
        </form>

        {/* Link Quên mật khẩu */}
        <button
          type="button"
          onClick={() => showToast("Tính năng khôi phục mật khẩu")}
          className="text-xs text-zinc-500 hover:text-zinc-400 text-center block mt-3.5 transition-colors cursor-pointer"
        >
          Forgot password?
        </button>

        {/* Đường phân cách or */}
        <div className="w-full flex items-center gap-4 my-5.5">
          <div className="h-px bg-zinc-800/80 flex-1" />
          <span className="text-xs text-zinc-600 font-semibold lowercase">or</span>
          <div className="h-px bg-zinc-800/80 flex-1" />
        </div>

        {/* Thẻ đăng nhập nhanh qua Instagram */}
        <button
          type="button"
          onClick={handleInstagramLogin}
          className="w-full p-4 rounded-2xl border border-zinc-800/80 bg-[#141414] hover:bg-[#1a1a1a] transition-all cursor-pointer flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            {/* Logo Gradient Instagram */}
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-md shrink-0">
              <InstagramGlyph className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-zinc-400 block">
                Continue with Instagram
              </span>
              <span className="text-sm font-bold text-white block tracking-tight">
                tuananhpika
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
        </button>
      </div>

      {/* 3. KHỐI QUÉT MÃ QR APP Ở GÓC PHẢI DƯỚI MÀN HÌNH */}
      <div className="fixed right-8 bottom-8 hidden lg:flex flex-col items-center z-20 select-none">
        <span className="text-xs text-zinc-500 font-medium mb-2.5">
          Scan to get the app
        </span>
        <div className="w-32 h-32 rounded-3xl bg-[#141414] border border-zinc-800/80 p-3 flex items-center justify-center shadow-2xl hover:border-zinc-700 transition-colors">
          <ThreadsQRCode />
        </div>
      </div>

      {/* 4. FOOTER CÁC ĐIỀU KHOẢN DƯỚI CÙNG TRANG */}
      <footer className="w-full z-20 pt-8 pb-2">
        <div className="flex items-center justify-center gap-3.5 text-xs text-zinc-600 font-normal flex-wrap">
          <span>© 2026</span>
          <button
            type="button"
            onClick={() => showToast("Threads Terms")}
            className="hover:underline transition-all cursor-pointer"
          >
            Threads Terms
          </button>
          <button
            type="button"
            onClick={() => showToast("Privacy Policy")}
            className="hover:underline transition-all cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => showToast("Cookies Policy")}
            className="hover:underline transition-all cursor-pointer"
          >
            Cookies Policy
          </button>
          <button
            type="button"
            onClick={() => showToast("Report a problem")}
            className="hover:underline transition-all cursor-pointer"
          >
            Report a problem
          </button>
        </div>
      </footer>

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-xl text-xs font-semibold shadow-2xl z-50 animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
