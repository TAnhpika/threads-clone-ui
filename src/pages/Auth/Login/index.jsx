import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X } from "lucide-react";
import { selectIsAuthenticated, loginSuccess } from "@/features/auth/authSlice";
import * as authService from "@/services/authService";
import { AuthInput, AuthButton, ThreadsQRCode } from "@/components/common";
import { InstagramAuthCard } from "@/components/auth";
import useLastLoginAccount from "@/hooks/useLastLoginAccount";

// Schema validation kiểm tra form với Yup
const loginSchema = yup.object().shape({
  identifier: yup
    .string()
    .trim()
    .required("Vui lòng nhập Username, phone hoặc email"),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawContinue = searchParams.get("continue");
  const continueUrl =
    rawContinue && rawContinue !== "/login" && rawContinue !== "%2Flogin"
      ? decodeURIComponent(rawContinue)
      : "/";
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const location = useLocation();
  const [routeSuccessMessage, setRouteSuccessMessage] = useState(() => {
    if (location.state?.verified) {
      return "Đã xác minh tài khoản thành công. Vui lòng đăng nhập.";
    }
    return location.state?.message || null;
  });

  useEffect(() => {
    if (location.state?.verified) {
      setRouteSuccessMessage("Đã xác minh tài khoản thành công. Vui lòng đăng nhập.");
    } else if (location.state?.message) {
      setRouteSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Hook quản lý tài khoản & mật khẩu của lần đăng nhập gần nhất
  const { savedAccount, saveAccount } = useLastLoginAccount();

  const handleInputChange = () => {
    if (routeSuccessMessage) {
      setRouteSuccessMessage(null);
    }
  };

  // Cấu hình React Hook Form kết hợp Yup Resolver
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Nếu đã đăng nhập thì tự động chuyển tiếp tới continueUrl (mặc định vào Home "/")
  useEffect(() => {
    if (isAuthenticated) {
      navigate(continueUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, continueUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsQrModalOpen(false);
      }
    };
    if (isQrModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQrModalOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Xử lý khi Yup validation ở client phát hiện lỗi
  const onInvalid = (errors) => {
    const firstError = errors.identifier?.message || errors.password?.message;
    if (firstError) {
      showToast(firstError);
    }
  };

  // 1. Submit form đăng nhập: Gọi API "Login", lưu token và dispatch API "Get User Info"
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const identifier = data.identifier.trim();
      const payload = {
        login: identifier,
        password: data.password.trim(),
      };

      // Gọi API Login
      const response = await authService.login(payload);
      const resData = response?.data || response;
      const accessToken = resData?.access_token || resData?.accessToken;
      const refreshToken = resData?.refresh_token || resData?.refreshToken;
      const user = resData?.user || resData;

      // Lưu access_token và refresh_token vào localStorage
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Lưu user vào Redux store ngay từ response đăng nhập
      dispatch(loginSuccess({ user, accessToken, refreshToken }));

      // Lưu thông tin tài khoản và mật khẩu của lần đăng nhập gần nhất cho nút Tiếp tục bằng Instagram
      saveAccount({
        identifier,
        password: data.password.trim(),
        username: user?.username || identifier,
        name: user?.name || user?.username || identifier,
        avatar: user?.avatar_url || user?.avatar || null,
      });

      // Gọi API "Get User Info" (/auth/user) để đồng bộ đầy đủ thông tin người dùng
      try {
        await dispatch(authService.getCurrentUser()).unwrap();
      } catch (userErr) {
        console.warn("Could not sync getCurrentUser, but login succeeded:", userErr);
      }

      showToast("Đăng nhập thành công!");
      navigate(continueUrl, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      // Xử lý hiển thị lỗi tài khoản / mật khẩu không đúng từ response server
      const resData = error.response?.data;
      let errorMsg = "Tài khoản hoặc mật khẩu không chính xác!";

      if (error.response?.status === 401) {
        errorMsg = "Tài khoản hoặc mật khẩu không chính xác!";
      } else if (resData?.errors && typeof resData.errors === "object") {
        const firstErr = Object.values(resData.errors).flat()[0];
        errorMsg = firstErr || resData.message || "Thông tin đăng nhập không hợp lệ!";
      } else if (resData?.message) {
        if (typeof resData.message === "string") {
          if (resData.message.toLowerCase().includes("invalid credentials")) {
            errorMsg = "Tài khoản hoặc mật khẩu không chính xác!";
          } else {
            errorMsg = resData.message;
          }
        } else if (typeof resData.message === "object") {
          errorMsg = Object.values(resData.message).flat().join(" - ");
        }
      } else if (resData?.error) {
        errorMsg = typeof resData.error === "string" ? resData.error : JSON.stringify(resData.error);
      } else if (error.message) {
        errorMsg = error.message;
      }

      showToast(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Đăng nhập nhanh qua Instagram: Sử dụng tài khoản và mật khẩu của lần đăng nhập gần nhất (nếu có)
  const handleInstagramLogin = () => {
    if (!savedAccount?.password) {
      const input = document.querySelector('input[name="identifier"]');
      if (input) input.focus();
      return;
    }
    const targetIdentifier = savedAccount?.identifier || savedAccount?.username;
    const targetPassword = savedAccount?.password;
    setValue("identifier", targetIdentifier);
    setValue("password", targetPassword);
    onSubmit({
      identifier: targetIdentifier,
      password: targetPassword,
    });
  };

  return (
    <>
      <div className="w-full max-w-92.5 z-20 flex flex-col items-center pt-20 sm:pt-24 my-auto">
        {/* Tiêu đề */}
        <h1 className="text-sm sm:text-base font-bold text-black dark:text-white text-center mb-4 tracking-tight">
          Log in with your Instagram account
        </h1>

        {/* Thông báo thành công từ route state (Mục 6: Tạo mật khẩu mới thành công, vui lòng đăng nhập) */}
        {routeSuccessMessage && (
          <div className="w-full px-5 py-3.5 mb-4 rounded-2xl bg-[#f0fdf4] dark:bg-[#062d1c] border border-[#bbf7d0] dark:border-[#059669]/40 text-[#166534] dark:text-[#86efac] text-xs sm:text-[13px] font-normal leading-relaxed text-left animate-in fade-in zoom-in-95 duration-200">
            {routeSuccessMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="w-full space-y-2.5">
          {/* Input Identifier */}
          <AuthInput
            label="Username, phone or email"
            type="text"
            error={errors.identifier}
            {...register("identifier", {
              onChange: handleInputChange,
            })}
          />

          {/* Input Password */}
          <AuthInput
            label="Password"
            type="password"
            error={errors.password}
            {...register("password", {
              onChange: handleInputChange,
            })}
          />

          {/* Nút Log in */}
          <div className="pt-1">
            <AuthButton type="submit" isLoading={isLoading}>
              Log in
            </AuthButton>
          </div>
        </form>

        {/* Link Quên mật khẩu -> /forgot-password */}
        <Link
          to="/forgot-password"
          className="text-xs text-zinc-500 hover:text-black dark:hover:text-zinc-300 text-center block mt-3.5 transition-colors cursor-pointer hover:underline"
        >
          Quên mật khẩu?
        </Link>

        {/* Đường phân cách hoặc */}
        <div className="w-full flex items-center gap-4 my-5.5">
          <div className="h-px bg-zinc-200 dark:bg-zinc-800/80 flex-1" />
          <span className="text-xs text-zinc-400 dark:text-zinc-600 font-semibold lowercase">hoặc</span>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800/80 flex-1" />
        </div>

        {/* Thẻ đăng nhập nhanh qua Instagram */}
        <InstagramAuthCard
          username={savedAccount?.username || savedAccount?.identifier}
          avatar={savedAccount?.avatar}
          title="Tiếp tục bằng Instagram"
          onClick={handleInstagramLogin}
        />

        {/* Dòng Bạn chưa có tài khoản? Đăng ký -> /register */}
        <div className="mt-5 text-center">
          <Link
            to="/register"
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <span>Bạn chưa có tài khoản? </span>
            <span className="font-semibold text-black dark:text-white underline-offset-2 hover:underline">
              Đăng ký
            </span>
          </Link>
        </div>
      </div>

      {/* 3. KHỐI QUÉT MÃ QR APP Ở GÓC PHẢI DƯỚI MÀN HÌNH */}
      <div className="fixed right-8 bottom-8 hidden lg:flex flex-col items-center z-20 select-none">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-3">
          Scan to get the app
        </span>
        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="w-44 h-44 rounded-4xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800/80 p-4 flex items-center justify-center shadow-xl dark:shadow-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
          title="Scan to get the app"
        >
          <ThreadsQRCode className="w-36 h-36 text-black dark:text-white transition-transform duration-200 group-hover:scale-102" />
        </button>
      </div>

      {/* MODAL PHÓNG TO QR SCAN KHI CLICK */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
          onClick={() => setIsQrModalOpen(false)}
        >
          {/* Nút đóng tròn ở góc trên bên trái */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(false)}
            aria-label="Close"
            className="absolute top-6 left-6 w-11 h-11 rounded-full bg-white dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white" />
          </button>

          {/* Hộp QR phóng to trung tâm */}
          <div
            className="rounded-4xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800/80 p-8 sm:p-10 flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ThreadsQRCode className="w-56 h-56 sm:w-64 sm:h-64 text-black dark:text-white" />
            <span className="mt-6 text-base font-bold text-black dark:text-white tracking-tight">
              Get the app
            </span>
          </div>
        </div>
      )}

      {/* Toast thông báo phong cách Threads */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 px-4.5 py-2.5 bg-black/95 dark:bg-white text-white dark:text-black border border-zinc-800/80 dark:border-zinc-200 rounded-2xl text-xs font-semibold shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 whitespace-nowrap">
          {toastMessage}
        </div>
      )}
    </>
  );
}
