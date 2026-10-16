import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AuthInput from "@/components/common/AuthInput";
import AuthButton from "@/components/common/AuthButton";
import AuthAlert from "@/components/common/AuthAlert";
import { EMAIL_REGEX } from "@/utils/validators";
import * as authService from "@/services/authService";
import threadsLoginBg from "@/assets/images/threads-login-bg.webp";

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required("Vui lòng nhập email")
    .matches(EMAIL_REGEX, "Email không đúng định dạng"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Nếu người dùng mở link có token tại /forgot-password, chuyển hướng tới /reset-password
  useEffect(() => {
    if (token) {
      navigate(`/reset-password?token=${encodeURIComponent(token)}`, { replace: true });
    }
  }, [token, navigate]);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Luôn hiện sẵn thanh cuộn để giao diện không bị giật khi lỗi xuất hiện
  useEffect(() => {
    document.documentElement.classList.add("overflow-y-scroll");
    return () => {
      document.documentElement.classList.remove("overflow-y-scroll");
    };
  }, []);

  const handleInputChange = () => {
    if (errors.email) {
      clearErrors("email");
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await authService.forgotPassword(data.email.trim());
      setSuccessMessage("Liên kết đặt lại mật khẩu đã được gửi tới email của bạn");
    } catch (error) {
      const resData = error.response?.data;
      const resMsg = resData?.message;

      if (resData?.errors?.email) {
        setError("email", {
          type: "server",
          message: resData.errors.email[0] || "Email không hợp lệ",
        });
      } else if (typeof resMsg === "string" && resMsg.toLowerCase().includes("email")) {
        setError("email", {
          type: "server",
          message: resMsg,
        });
      } else {
        setErrorMessage(
          typeof resMsg === "string" ? resMsg : "Gửi yêu cầu thất bại, vui lòng thử lại!"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Main Box */}
      <div className="w-full max-w-92.5 z-20 flex flex-col items-center pt-20 sm:pt-24 my-auto">
        <h1 className="text-base sm:text-lg font-bold text-black dark:text-white text-center mb-2 tracking-tight">
          Quên mật khẩu?
        </h1>

        {/* Thông báo gửi thành công (khung xanh lam) */}
        {successMessage && (
          <AuthAlert type="success" message={successMessage} />
        )}

        {/* Thông báo lỗi chung nếu có */}
        {errorMessage && (
          <AuthAlert type="error" message={errorMessage} />
        )}

        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-5 leading-relaxed">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3.5">
          <AuthInput
            label="Email"
            type="email"
            placeholder="nguyenvana@gmail.com"
            error={errors.email}
            {...register("email", {
              onChange: handleInputChange,
            })}
          />

          <AuthButton type="submit" isLoading={isLoading}>
            Đặt lại mật khẩu
          </AuthButton>
        </form>

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
    </div>
  );
}
