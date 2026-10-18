import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AlertCircle } from "lucide-react";
import AuthInput from "@/components/common/AuthInput";
import AuthButton from "@/components/common/AuthButton";
import AuthAlert from "@/components/common/AuthAlert";
import * as authService from "@/services/authService";

// Validation schema tương tự trang Register
const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu mới")
    .min(8, "Mật khẩu tối thiểu 8 ký tự"),
  password_confirmation: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp"),
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Trạng thái kiểm tra token: 'validating' | 'valid' | 'invalid'
  const [tokenStatus, setTokenStatus] = useState("validating");
  const [tokenErrorMessage, setTokenErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    clearErrors,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });


  // Gọi API "Validate Reset Token" khi mở trang
  useEffect(() => {
    let isMounted = true;

    const checkToken = async () => {
      if (!token) {
        if (isMounted) {
          setTokenStatus("invalid");
          setTokenErrorMessage("Liên kết đã hết hạn hoặc không hợp lệ");
        }
        return;
      }

      try {
        const res = await authService.validateResetToken(token);
        const isValid = res?.data?.valid ?? res?.valid ?? false;
        if (isMounted) {
          if (isValid) {
            setTokenStatus("valid");
          } else {
            setTokenStatus("invalid");
            setTokenErrorMessage("Liên kết đã hết hạn hoặc không hợp lệ");
          }
        }
      } catch (error) {
        if (isMounted) {
          const resMsg =
            error.response?.data?.message ||
            "Liên kết đã hết hạn hoặc không hợp lệ";
          setTokenStatus("invalid");
          setTokenErrorMessage(
            resMsg.toLowerCase().includes("invalid or expired")
              ? "Liên kết đã hết hạn hoặc không hợp lệ"
              : resMsg
          );
        }
      }
    };

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleInputChange = (fieldName) => {
    if (errors[fieldName]) {
      clearErrors(fieldName);
    }
    if (submitErrorMessage) {
      setSubmitErrorMessage(null);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSubmitErrorMessage(null);

    try {
      await authService.resetPassword({
        token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      // Thành công: chuyển hướng về /login kèm route state message
      navigate("/login", {
        state: {
          message: "Tạo mật khẩu mới thành công, vui lòng đăng nhập",
        },
      });
    } catch (error) {
      const resMsg =
        error.response?.data?.message ||
        "Đặt lại mật khẩu thất bại. Vui lòng thử lại!";
      setSubmitErrorMessage(
        typeof resMsg === "string" && resMsg.toLowerCase().includes("invalid or expired")
          ? "Liên kết đã hết hạn hoặc không hợp lệ"
          : resMsg
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-92.5 z-20 flex flex-col items-center pt-20 sm:pt-24 my-auto">
        <h1 className="text-base sm:text-lg font-bold text-black dark:text-white text-center mb-4 tracking-tight">
          Tạo mật khẩu mới
        </h1>

        {/* 1. Trạng thái đang kiểm tra token */}
        {tokenStatus === "validating" && (
          <div className="w-full py-8 flex flex-col items-center justify-center gap-2 text-zinc-400">
            <div className="w-6 h-6 border-2 border-zinc-400/30 border-t-black dark:border-t-white rounded-full animate-spin" />
            <p className="text-xs text-zinc-500">Đang xác thực liên kết...</p>
          </div>
        )}

        {/* 2. Trạng thái token lỗi/hết hạn: hiển thị thông báo lỗi, KHÔNG hiển thị form (Mục 3) */}
        {tokenStatus === "invalid" && (
          <div className="w-full px-5 py-4 mb-5 rounded-2xl bg-[#fff5f5] dark:bg-[#2a0e0e] border border-[#fecaca] dark:border-[#991b1b]/40 text-[#dc2626] dark:text-[#f87171] text-xs sm:text-[13px] font-normal leading-relaxed text-center animate-in fade-in zoom-in-95 duration-200">
            {tokenErrorMessage || "Liên kết đã hết hạn hoặc không hợp lệ"}
          </div>
        )}

        {/* 3. Trạng thái token hợp lệ: hiển thị form tạo mật khẩu mới (Mục 4) */}
        {tokenStatus === "valid" && (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3.5">
            {/* Thông báo lỗi khi submit nếu có */}
            {submitErrorMessage && (
              <AuthAlert type="error" message={submitErrorMessage} />
            )}

            {/* Mật khẩu mới */}
            <AuthInput
              label="Mật khẩu mới"
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

            {/* Nút Tạo mật khẩu mới (Mục 5) */}
            <div className="pt-1">
              <AuthButton type="submit" isLoading={isLoading}>
                Tạo mật khẩu mới
              </AuthButton>
            </div>
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
  );
}
