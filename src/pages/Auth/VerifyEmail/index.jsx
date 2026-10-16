import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import http from "@/utils/http";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("token_verify");
  const email = searchParams.get("email");

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      // Nếu có token gửi từ email
      if (token) {
        try {
          const res = await http.get(`/auth/verify-email?token=${encodeURIComponent(token)}${email ? `&email=${encodeURIComponent(email)}` : ""}`);
          if (isMounted) {
            setStatus("success");
            setMessage(res?.message || "Tài khoản của bạn đã được xác thực thành công!");
          }
        } catch (error) {
          if (isMounted) {
            setStatus("error");
            setMessage(error.response?.data?.message || "Liên kết xác thực không hợp lệ hoặc đã hết hạn.");
          }
        }
      } else {
        // Nếu không có token param nhưng mở trang trực tiếp
        if (isMounted) {
          setStatus("success");
          setMessage("Tài khoản của bạn đã được xác thực thành công!");
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, email]);

  return (
    <div className="w-full max-w-92.5 z-20 flex flex-col items-center pt-24 sm:pt-28 my-auto">
        <div className="w-full p-6 rounded-2xl bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-center space-y-4 shadow-sm">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
              <p className="text-sm font-semibold text-black dark:text-white">
                Đang xác thực tài khoản...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <h2 className="text-base font-bold text-black dark:text-white">
                Xác thực thành công!
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {message}
              </p>
              <div className="w-full pt-2">
                <Link
                  to="/login"
                  className="w-full h-12 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm flex items-center justify-center transition-all shadow-md"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <h2 className="text-base font-bold text-black dark:text-white">
                Xác thực thất bại
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {message}
              </p>
              <div className="w-full pt-2">
                <Link
                  to="/register"
                  className="w-full h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold text-sm flex items-center justify-center transition-all"
                >
                  Quay lại đăng ký
                </Link>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
