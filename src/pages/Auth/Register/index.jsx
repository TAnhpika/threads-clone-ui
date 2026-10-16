import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as authService from "@/services/authService";
import threadsLoginBg from "@/assets/images/threads-login-bg.webp";

const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required("Vui lòng nhập họ và tên đệm")
    .min(2, "Tối thiểu 2 ký tự"),
  lastName: yup
    .string()
    .trim()
    .required("Vui lòng nhập tên")
    .min(2, "Tối thiểu 2 ký tự"),
  email: yup
    .string()
    .trim()
    .required("Vui lòng nhập email")
    .email("Email không hợp lệ"),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu tối thiểu 8 ký tự"),
  password_confirmation: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp"),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      showToast("Đăng ký tài khoản thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const resData = error.response?.data;
      let errorMsg = "Đăng ký thất bại, vui lòng thử lại!";
      if (resData?.message) {
        errorMsg = typeof resData.message === "string" ? resData.message : Object.values(resData.message).flat().join(" - ");
      }
      showToast(errorMsg);
    } finally {
      setIsLoading(false);
    }
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

      {/* Main Register Form */}
      <div className="w-full max-w-92.5 z-20 flex flex-col items-center pt-20 sm:pt-24 my-auto">
        <h1 className="text-base sm:text-lg font-bold text-black dark:text-white text-center mb-1 tracking-tight">
          Tạo tài khoản Threads
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-5">
          Tham gia chia sẻ ý tưởng và kết nối với mọi người
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                {...register("firstName")}
                placeholder="Họ & tên đệm"
                className="w-full h-12 px-4 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
              {errors.firstName && (
                <p className="text-[11px] text-red-500 mt-1 px-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                {...register("lastName")}
                placeholder="Tên"
                className="w-full h-12 px-4 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
              {errors.lastName && (
                <p className="text-[11px] text-red-500 mt-1 px-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="email"
              {...register("email")}
              placeholder="Email"
              className="w-full h-12 px-4 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1 px-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              {...register("password")}
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              className="w-full h-12 px-4 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
            />
            {errors.password && (
              <p className="text-[11px] text-red-500 mt-1 px-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              {...register("password_confirmation")}
              placeholder="Xác nhận mật khẩu"
              className="w-full h-12 px-4 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
            />
            {errors.password_confirmation && (
              <p className="text-[11px] text-red-500 mt-1 px-1">{errors.password_confirmation.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm sm:text-base active:scale-99 transition-all cursor-pointer flex items-center justify-center shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
              ) : (
                "Đăng ký"
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <span>Đã có tài khoản? </span>
            <span className="font-semibold text-black dark:text-white underline-offset-2 hover:underline">
              Đăng nhập
            </span>
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
