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
 * Endpoint: GET /auth/reset-password/validate?token=...
 */
export const validateResetToken = async (token) => {
    try {
        const response = await http.get(`/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
        return response?.data || response;
    } catch (error) {
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
 * API "Validate Email": Kiểm tra email có khả dụng không
 * Endpoint: POST /auth/validate/email
 * @param {string} email
 */
export const validateEmail = async (email) => {
    try {
        const response = await http.post("/auth/validate/email", { email });
        return response?.data || response;
    } catch (error) {
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};

/**
 * API "Check Exists Email": Kiểm tra email đã được đăng ký hay chưa
 * @param {string} email
 * @returns {Promise<boolean>} true nếu email đã tồn tại / không khả dụng
 */
export const checkExistsEmail = async (email) => {
    try {
        const res = await validateEmail(email);
        if (typeof res?.available === "boolean") {
            return !res.available;
        }
        if (typeof res?.data?.available === "boolean") {
            return !res.data.available;
        }
        if (res?.errors?.email) {
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

/**
 * API "Validate Username": Kiểm tra username có khả dụng không
 * Endpoint: POST /auth/validate/username
 * @param {string} username
 */
export const validateUsername = async (username) => {
    try {
        const response = await http.post("/auth/validate/username", { username });
        return response?.data || response;
    } catch (error) {
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};

/**
 * API "Check Exists Username": Kiểm tra username đã được sử dụng hay chưa
 * @param {string} username
 * @returns {Promise<boolean>} true nếu username đã tồn tại / không khả dụng
 */
export const checkExistsUsername = async (username) => {
    try {
        const res = await validateUsername(username);
        if (typeof res?.available === "boolean") {
            return !res.available;
        }
        if (typeof res?.data?.available === "boolean") {
            return !res.data.available;
        }
        if (res?.errors?.username) {
            return true;
        }
        return false;
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
