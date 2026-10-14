import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "@/services/authService";
import { selectIsAuthenticated } from "@/features/auth/authSlice";

/**
 * Component AuthProvider: Tự động gọi API "Get User Info" khi ứng dụng khởi động
 * nếu đã có accessToken trong localStorage, nhằm đồng bộ thông tin người dùng vào global state.
 */
export default function AuthProvider({ children }) {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token && isAuthenticated) {
            dispatch(getCurrentUser());
        }
    }, [dispatch, isAuthenticated]);

    return children || null;
}
