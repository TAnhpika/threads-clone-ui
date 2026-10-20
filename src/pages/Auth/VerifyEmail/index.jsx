import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/services/authService";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("token_verify");
  const email = searchParams.get("email");

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      // 1. Nếu có token trên URL -> gọi API Verify Email
      if (token) {
        try {
          await verifyEmail({ token, email });
          if (isMounted) {
            // Thành công: tự động chuyển về /login kèm state { verified: true }
            navigate("/login", {
              replace: true,
              state: { verified: true },
            });
          }
        } catch (error) {
          if (isMounted) {
            setStatus("error");
            const resData = error.response?.data;
            let errMsg = "Liên kết đã hết hạn hoặc không hợp lệ.";
            if (resData?.errors?.token) {
              errMsg = Array.isArray(resData.errors.token)
                ? resData.errors.token[0]
                : resData.errors.token;
            } else if (resData?.message && typeof resData.message === "string") {
              errMsg = "Liên kết đã hết hạn hoặc không hợp lệ.";
            }
            setMessage(errMsg);
          }
        }
      } else {
        // 2. Nếu không có token -> Báo lỗi liên kết không hợp lệ
        if (isMounted) {
          setStatus("error");
          setMessage("Liên kết đã hết hạn hoặc không hợp lệ.");
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, email, navigate]);

  return (
    <div className="w-full max-w-92.5 z-20 flex flex-col items-center pt-20 sm:pt-24 my-auto select-none">
      {/* Tiêu đề cố định trên cùng */}
      <h1 className="text-base sm:text-lg font-bold text-black dark:text-white text-center mb-5 tracking-tight">
        Xác minh tài khoản
      </h1>

      {/* A. Đang gọi API: Loading spinner + 'Đang xác minh...' trong khung bo tròn */}
      {status === "verifying" && (
        <div className="w-full h-32 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-transparent flex flex-col items-center justify-center gap-3 animate-in fade-in duration-150">
          <div className="w-7 h-7 border-[2.5px] border-zinc-300 dark:border-zinc-700 border-t-black dark:border-t-white rounded-full animate-spin" />
          <p className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
            Đang xác minh...
          </p>
        </div>
      )}

      {/* B. Thất bại: Không có form, chỉ có khung lỗi màu đỏ + nút 'Đi tới trang đăng nhập' */}
      {status === "error" && (
        <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
          {/* Khung lỗi màu đỏ */}
          <div className="w-full px-5 py-3.5 mb-3.5 rounded-2xl bg-[#fef2f2] dark:bg-[#2c1314] border border-[#fecaca] dark:border-[#ef4444]/40 text-[#dc2626] dark:text-[#f87171] text-xs sm:text-[13px] font-normal leading-relaxed text-center">
            {message || "Liên kết đã hết hạn hoặc không hợp lệ."}
          </div>

          {/* Nút 'Đi tới trang đăng nhập' */}
          <Link
            to="/login"
            className="w-full h-12 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm flex items-center justify-center transition-all shadow-xs active:scale-[0.99]"
          >
            Đi tới trang đăng nhập
          </Link>
        </div>
      )}
    </div>
  );
}
