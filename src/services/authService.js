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
