import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectAuthFetching,
} from "@/features/auth/authSlice";

export default function PrivateRoute() {
    const location = useLocation();
    const currentUser = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const fetching = useSelector(selectAuthFetching);

    if (fetching && !currentUser) {
        return (
            <div className="flex items-center justify-center min-h-75">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin dark:border-zinc-700 dark:border-t-white" />
            </div>
        );
    }

    if (!isAuthenticated || !currentUser) {
        // Lưu lại pathname hiện tại để sau khi đăng nhập có thể quay lại đúng trang
        return (
            <Navigate
                to={`/login?continue=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    return <Outlet />;
}
