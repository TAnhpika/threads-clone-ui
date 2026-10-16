import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import AuthInput from "@/components/common/AuthInput";
import useEmailCheck from "@/hooks/useEmailCheck";
import { registerSchema } from "@/utils/validators";
import * as authService from "@/services/authService";
import threadsLoginBg from "@/assets/images/threads-login-bg.webp";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [generalErrorMessage, setGeneralErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setError,
    clearErrors,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  // Tái sử dụng logic kiểm tra email từ custom hook useEmailCheck
  const emailValue = watch("email");
  const emailCheck = useEmailCheck({
    emailValue,
    trigger,
    clearErrors,
  });

  // Khi đang hiện thông báo lỗi, nếu input được chỉnh sửa (thêm / xóa ký tự) thì tắt thông báo lỗi ngay
  const handleInputChange = (fieldName) => {
    if (errors[fieldName]) {
      clearErrors(fieldName);
    }
    if (generalErrorMessage) {
      setGeneralErrorMessage(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  // Luôn hiện sẵn thanh cuộn (scrollbar) khi vào register để khi thông báo lỗi hiện lên không bị giật giao diện
  useEffect(() => {
    document.documentElement.classList.add("overflow-y-scroll");
    return () => {
      document.documentElement.classList.remove("overflow-y-scroll");
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setGeneralErrorMessage(null);

    try {
      await authService.register(data);
      // Đăng ký thành công: hiển thị thông báo theo yêu cầu
      setSuccessMessage(
        "Chúng tôi đã gửi một liên kết xác thực tới email của bạn. Vui lòng kiểm tra email để xác thực tài khoản."
      );
      reset();
      emailCheck.resetStatus();
    } catch (error) {
      const resData = error.response?.data;
      const resMsg = resData?.message;
      const fieldErrors = resData?.errors;

      // Phân giải lỗi chi tiết từ response backend:
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.entries(fieldErrors).forEach(([field, msgs]) => {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs;
          setError(field, { type: "server", message: msg });
          if (field === "email") {
            emailCheck.setStatus("error");
          }
        });
      } else if (typeof resMsg === "string") {
        if (resMsg.toLowerCase().includes("email")) {
          setError("email", {
            type: "server",
            message: "Email này đã được sử dụng",
          });
          emailCheck.setStatus("error");
        } else if (resMsg.toLowerCase().includes("password")) {
          setError("password", {
            type: "server",
            message: resMsg,
          });
        } else {
          setGeneralErrorMessage(resMsg);
        }
      } else {
        setGeneralErrorMessage("Đăng ký thất bại, vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailError = !!errors.email && emailCheck.status === "error";
  const currentEmailStatus =
    emailCheck.status === "checking"
      ? "checking"
      : isEmailError
      ? "error"
      : emailCheck.status === "success" || emailCheck.status === "typing"
      ? "success"
      : "idle";

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-white dark:bg-[#0a0a0a] text-black dark:text-white overflow-x-hidden select-none px-4 py-6 transition-colors duration-200">
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
        <h1 className="text-base sm:text-lg font-bold text-black dark:text-white text-center mb-3 tracking-tight">
          Đăng ký tài khoản
        </h1>

        {/* Thông báo đăng ký thành công */}
        {successMessage ? (
          <div className="w-full px-5 py-4 mb-4 rounded-2xl bg-[#f0f7ff] dark:bg-[#0c1e38] border border-[#c7ddfd] dark:border-[#1d4ed8]/40 text-[#1e40af] dark:text-[#93c5fd] text-xs sm:text-[13px] font-normal leading-relaxed text-left animate-in fade-in zoom-in-95 duration-200">
            {successMessage}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-5">
            Tham gia chia sẻ ý tưởng và kết nối với mọi người
          </p>
        )}

        {/* Thông báo lỗi chung nếu có */}
        {generalErrorMessage && (
          <div className="w-full p-3.5 mb-4 rounded-2xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-medium text-center flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalErrorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
          {/* Họ & tên đệm + Tên */}
          <div className="grid grid-cols-2 gap-2">
            <AuthInput
              label="Họ & tên đệm"
              type="text"
              placeholder="Nguyễn Văn"
              error={errors.firstName}
              {...register("firstName", {
                onChange: () => handleInputChange("firstName"),
              })}
            />

            <AuthInput
              label="Tên"
              type="text"
              placeholder="A"
              error={errors.lastName}
              {...register("lastName", {
                onChange: () => handleInputChange("lastName"),
              })}
            />
          </div>

          {/* Email */}
          <AuthInput
            label="Email"
            type="email"
            placeholder="nguyenvana@gmail.com"
            error={isEmailError ? errors.email : null}
            rightSlot={
              <>
                {currentEmailStatus === "checking" && (
                  <div
                    title="Đang kiểm tra..."
                    className="w-4.5 h-4.5 rounded-full border-2 border-zinc-400/30 border-t-blue-500 dark:border-zinc-600/40 dark:border-t-blue-400 animate-spin"
                  />
                )}
                {currentEmailStatus === "error" && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue("email", "");
                      emailCheck.resetStatus();
                      clearErrors("email");
                    }}
                    tabIndex={-1}
                    className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer"
                    title="Xóa email"
                  >
                    <X className="w-5 h-5" strokeWidth={2.2} />
                  </button>
                )}
                {currentEmailStatus === "success" && (
                  <CheckCircle2
                    className="w-5 h-5 text-green-500 shrink-0"
                    strokeWidth={2.2}
                  />
                )}
              </>
            }
            {...register("email", {
              onChange: () => handleInputChange("email"),
              onBlur: emailCheck.handleBlur,
            })}
          />

          {/* Mật khẩu */}
          <AuthInput
            label="Mật khẩu"
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            error={errors.password}
            {...register("password", {
              onChange: () => handleInputChange("password"),
              onBlur: () => {
                if (getValues("password_confirmation")) {
                  trigger("password_confirmation");
                }
              },
            })}
          />

          {/* Xác nhận mật khẩu */}
          <AuthInput
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Nhập lại mật khẩu"
            error={errors.password_confirmation}
            {...register("password_confirmation", {
              onChange: () => handleInputChange("password_confirmation"),
            })}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-13.5 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm sm:text-base active:scale-99 transition-all cursor-pointer flex items-center justify-center shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
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
