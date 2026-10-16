import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CheckCircle2, X } from "lucide-react";
import AuthInput from "@/components/common/AuthInput";
import AuthButton from "@/components/common/AuthButton";
import AuthAlert from "@/components/common/AuthAlert";
import useEmailCheck from "@/hooks/useEmailCheck";
import { registerSchema } from "@/utils/validators";
import * as authService from "@/services/authService";

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
      username: "",
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setGeneralErrorMessage(null);

    try {
      await authService.register({
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      // Đăng ký thành công: hiển thị thông báo theo yêu cầu
      setSuccessMessage(
        "Chúng tôi đã gửi một liên kết xác thực tới email của bạn. Vui lòng kiểm tra email để xác thực tài khoản."
      );
      reset();
      emailCheck.resetStatus();
    } catch (error) {
      const resData = error.response?.data;
      const resMsg = resData?.message;
      const fieldErrors = resData?.errors || (typeof resMsg === "object" ? resMsg : null);

      // Phân giải lỗi chi tiết từ response backend:
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.entries(fieldErrors).forEach(([field, msgs]) => {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs;
          if (field === "username" || field === "firstName" || field === "lastName") {
            setError("username", { type: "server", message: msg });
          } else {
            setError(field, { type: "server", message: msg });
          }
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
        } else if (resMsg.toLowerCase().includes("username")) {
          setError("username", {
            type: "server",
            message: resMsg,
          });
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
    <>
      {/* Main Register Form */}
      <div className="w-full max-w-92.5 z-20 flex flex-col items-center pt-20 sm:pt-24 my-auto">
        <h1 className="text-base sm:text-lg font-bold text-black dark:text-white text-center mb-3 tracking-tight">
          Đăng ký tài khoản
        </h1>

        {/* Thông báo đăng ký thành công */}
        {successMessage ? (
          <AuthAlert type="success" message={successMessage} className="mb-4" />
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-5">
            Tham gia chia sẻ ý tưởng và kết nối với mọi người
          </p>
        )}

        {/* Thông báo lỗi chung nếu có */}
        {generalErrorMessage && (
          <AuthAlert type="error" message={generalErrorMessage} className="mb-4" />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
          {/* Tên hiển thị */}
          <AuthInput
            label="Tên hiển thị"
            type="text"
            showClearButton
            onClear={() => {
              setValue("username", "");
              clearErrors("username");
            }}
            error={errors.username}
            {...register("username", {
              onChange: () => handleInputChange("username"),
            })}
          />

          {/* Email */}
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
              ) : currentEmailStatus === "success" && !isEmailError ? (
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
              onChange: () => handleInputChange("email"),
              onBlur: emailCheck.handleBlur,
            })}
          />

          {/* Mật khẩu */}
          <AuthInput
            label="Mật khẩu"
            type="password"
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
            error={errors.password_confirmation}
            {...register("password_confirmation", {
              onChange: () => handleInputChange("password_confirmation"),
            })}
          />

          <div className="pt-2">
            <AuthButton type="submit" isLoading={isLoading}>
              Đăng ký
            </AuthButton>
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

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4.5 py-2.5 bg-black/95 dark:bg-white text-white dark:text-black border border-zinc-800/80 dark:border-zinc-200 rounded-2xl text-xs font-semibold shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </>
  );
}
