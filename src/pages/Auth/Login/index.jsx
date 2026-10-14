import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginSuccess } from "@/features/auth/authSlice";
import userAvatar from "@/assets/images/ava.png";

const loginSchema = yup.object().shape({
    email: yup
        .string()
        .required("Vui lòng nhập email")
        .email("Email không đúng định dạng"),
    password: yup
        .string()
        .required("Vui lòng nhập mật khẩu")
        .min(6, "Mật khẩu phải từ 6 ký tự"),
});

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const continueUrl = searchParams.get("continue") || "/";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(loginSchema),
        mode: "onBlur",
    });

    const onSubmit = async (data) => {
        try {
            // Giả lập API gọi đăng nhập (thay thế bằng gọi http.post('/auth/login', data))
            console.log("Submitted data:", data);

            // Lưu kết quả vào Redux Store
            dispatch(
                loginSuccess({
                    user: {
                        id: "1",
                        name: "Alexander Vance",
                        username: "alexander.sartorial",
                        email: data.email,
                        avatar: userAvatar,
                    },
                    accessToken: "mock_access_token_123",
                    refreshToken: "mock_refresh_token_456",
                }),
            );

            // Chuyển hướng về trang trước đó user muốn truy cập
            navigate(decodeURIComponent(continueUrl), { replace: true });
        } catch (err) {
            console.error("Đăng nhập thất bại:", err);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-1 text-black dark:text-white">
                Đăng nhập tài khoản
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Nhập thông tin bên dưới để tiếp tục trải nghiệm
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Địa chỉ Email
                    </label>
                    <input
                        type="email"
                        placeholder="user@example.com"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Mật khẩu
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity mt-2 cursor-pointer"
                >
                    {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
}
