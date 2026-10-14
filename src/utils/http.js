import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_API || "https://api01.f8team.dev/api";

export const httpClient = axios.create({
    baseURL,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 1. Request Interceptor: Tự động đính kèm Bearer Token
httpClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// 2. Logic xử lý Silent Refresh Token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 3. Response Interceptor: Xử lý 401 Unauthorized
httpClient.interceptors.response.use(
    (response) => {
        // Trả về trực tiếp response.data để components không cần .data lặp lại
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        const isAuthRequest =
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register");

        // Không áp dụng refresh token hoặc redirect nếu chính request đăng nhập/đăng ký bị 401
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthRequest
        ) {
            if (isRefreshing) {
                // Đã có request trước đó kích hoạt refresh -> đưa request này vào hàng đợi
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return httpClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                // Không có refresh token -> xóa cache và chỉ redirect nếu không ở trang login
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                if (window.location.pathname !== "/login") {
                    window.location.href = `/login?continue=${encodeURIComponent(window.location.pathname)}`;
                }
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh bằng axios độc lập (không đi qua httpClient để tránh interceptor chặn)
                const res = await axios.post(`${baseURL}/auth/refresh-token`, {
                    refresh_token: refreshToken,
                });

                // Tùy theo cấu trúc response trả về của backend (vd: res.data.data hoặc res.data)
                const data = res.data?.data || res.data;
                const newAccessToken = data.access_token || data.accessToken;
                const newRefreshToken = data.refresh_token || data.refreshToken;

                localStorage.setItem("accessToken", newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                }

                httpClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return httpClient(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = `/login?continue=${encodeURIComponent(window.location.pathname)}`;
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

// Wrapper tiện ích xuất ra ngoài
const http = {
    get: (url, config) => httpClient.get(url, config),
    post: (url, data, config) => httpClient.post(url, data, config),
    put: (url, data, config) => httpClient.put(url, data, config),
    patch: (url, data, config) => httpClient.patch(url, data, config),
    delete: (url, config) => httpClient.delete(url, config),
};

export default http;
