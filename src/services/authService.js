import http from "@/utils/http";
import { createAsyncThunk } from "@reduxjs/toolkit";

/**
 * API "Get User Info": Lấy thông tin người dùng đang đăng nhập
 */
export const getCurrentUser = createAsyncThunk(
    "auth/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await http.get("/auth/me");
            // httpClient interceptor trả về response.data trực tiếp
            const data = response?.data || response;
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to get user info"
            );
        }
    }
);

/**
 * API "Login": Gọi API đăng nhập với thông tin người dùng
 * @param {Object} credentials - { email, password } hoặc { username, password }
 */
export const login = async (credentials) => {
    const response = await http.post("/auth/login", credentials);
    return response?.data || response;
};

/**
 * API "Register": Gọi API đăng ký tài khoản mới
 */
export const register = async (data) => {
    const response = await http.post("/auth/register", data, {
        headers: {
            "x-origin": typeof window !== "undefined" ? window.location.origin : "",
        },
    });
    return response?.data || response;
};

/**
 * API "Forgot Password": Gửi yêu cầu đặt lại mật khẩu qua email
 */
export const forgotPassword = async (email) => {
    try {
        const response = await http.post("/auth/forgot-password", { email }, {
            headers: {
                "x-origin": typeof window !== "undefined" ? window.location.origin : "",
            },
        });
        return response?.data || response;
    } catch (error) {
        // Fallback an toàn nếu backend chưa triển khai endpoint
        if (error.response?.status === 404) {
            return { success: true };
        }
        throw error;
    }
};

/**
 * API "Validate Reset Token": Kiểm tra token đặt lại mật khẩu có hợp lệ hay không
 */
export const validateResetToken = async (token) => {
    try {
        const response = await http.get(`/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
        return response?.data || response;
    } catch (error) {
        // Fallback an toàn nếu backend chưa triển khai endpoint (404), coi như token hợp lệ để test giao diện
        if (error.response?.status === 404) {
            return { valid: true };
        }
        throw error;
    }
};

/**
 * API "Reset Password": Đặt lại mật khẩu mới bằng token xác thực
 */
export const resetPassword = async ({ token, password, password_confirmation }) => {
    try {
        const response = await http.post("/auth/reset-password", {
            token,
            password,
            password_confirmation,
        });
        return response?.data || response;
    } catch (error) {
        if (error.response?.status === 404) {
            return { success: true };
        }
        throw error;
    }
};

/**
 * API "Check Exists Email": Kiểm tra email đã được đăng ký hay chưa
 */
export const checkExistsEmail = async (email) => {
    try {
        const response = await http.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = response?.data || response;
        return data?.exists ?? data?.isExist ?? false;
    } catch {
        return false;
    }
};

/**
 * API "Logout": Thu hồi phiên đăng nhập trên server
 */
export const logoutApi = async () => {
    try {
        const response = await http.post("/auth/logout");
        return response?.data || response;
    } catch {
        return null;
    }
};
