import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CheckCircle2, X } from "lucide-react";
import AuthInput from "@/components/common/AuthInput";
import AuthButton from "@/components/common/AuthButton";
import AuthAlert from "@/components/common/AuthAlert";
import useEmailCheck from "@/hooks/useEmailCheck";
import { forgotPasswordSchema } from "@/utils/validators";
import * as authService from "@/services/authService";

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
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const emailValue = watch("email");
  const emailCheck = useEmailCheck({
    emailValue,
    trigger,
    clearErrors,
  });

  const hasEmailError = Boolean(errors.email);
  const currentEmailStatus =
    emailCheck.status === "checking"
      ? "checking"
      : hasEmailError
      ? "error"
      : emailCheck.status === "success" || emailCheck.status === "typing"
      ? "success"
      : "idle";

  const handleInputChange = () => {
    if (errors.email) {
      clearErrors("email");
    }
    emailCheck.resetStatus();
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
        emailCheck.setStatus("error");
      } else if (typeof resMsg === "string" && resMsg.toLowerCase().includes("email")) {
        setError("email", {
          type: "server",
          message: resMsg,
        });
        emailCheck.setStatus("error");
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
            error={errors.email}
            rightSlot={
              currentEmailStatus === "checking" ? (
                <div
                  title="Đang kiểm tra..."
                  className="w-4.5 h-4.5 rounded-full border-2 border-zinc-400/30 border-t-blue-500 dark:border-zinc-600/40 dark:border-t-blue-400 animate-spin"
                />
              ) : currentEmailStatus === "success" && !hasEmailError ? (
                <CheckCircle2
                  className="w-5 h-5 text-green-500 shrink-0"
                  strokeWidth={2}
                />
              ) : emailValue ? (
                <button
                  type="button"
                  onClick={() => {
                    setValue("email", "");
                    emailCheck.resetStatus();
                    clearErrors("email");
                  }}
                  tabIndex={-1}
                  className="text-zinc-400 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center p-1"
                  title="Xóa email"
                >
                  <X className="w-5 h-5 shrink-0" strokeWidth={2} />
                </button>
              ) : null
            }
            {...register("email", {
              onChange: handleInputChange,
              onBlur: emailCheck.handleBlur,
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
  );
}
