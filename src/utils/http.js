import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_API || "https://threads.f8team.dev/api";

export const httpClient = axios.create({
    baseURL,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Helper set Bearer Authorization header tương thích Axios v1.x (AxiosHeaders) và v0.x
const setAuthHeader = (headers, token) => {
    if (!headers) return;
    if (typeof headers.set === "function") {
        headers.set("Authorization", `Bearer ${token}`);
    } else {
        headers.Authorization = `Bearer ${token}`;
    }
};

// Chuyển hướng người dùng qua /login kèm param continue nếu chưa ở trang login
const redirectToLogin = () => {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        const continueUrl = window.location.pathname + window.location.search;
        window.location.href = `/login?continue=${encodeURIComponent(continueUrl)}`;
    }
};

// 1. Request Interceptor: Tự động đính kèm Bearer Token
httpClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            setAuthHeader(config.headers, accessToken);
        }
        if (config.data instanceof FormData) {
            if (config.headers?.delete) {
                config.headers.delete("Content-Type");
            } else if (config.headers) {
                delete config.headers["Content-Type"];
            }
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
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh");

        // Khi token hết hạn (response code 401), chưa retry và không phải là request auth
        if (
            error.response?.status === 401 &&
            !originalRequest?._retry &&
            !isAuthRequest
        ) {
            // Trường hợp 1: Đang có tiến trình refresh token chạy -> xếp các request 401 tiếp theo vào hàng đợi
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest._retry = true;
                        setAuthHeader(originalRequest.headers, token);
                        return httpClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem("refreshToken");

            // Nếu không có refresh token lưu ở localStorage -> xóa token và chuyển hướng về /login
            if (!refreshToken) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                redirectToLogin();
                return Promise.reject(error);
            }

            // Gọi API "Refresh Token" để lấy token mới
            try {
                const res = await axios.post(`${baseURL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                // Nhận access_token và refresh_token mới
                const data = res.data?.data || res.data;
                const newAccessToken = data.access_token || data.accessToken;
                const newRefreshToken = data.refresh_token || data.refreshToken;

                if (!newAccessToken) {
                    throw new Error("No access_token returned from refresh API");
                }

                // Refresh thành công: lưu access_token và refresh_token mới vào localStorage
                localStorage.setItem("accessToken", newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                }

                // Cập nhật header cho các request trong tương lai
                setAuthHeader(httpClient.defaults.headers.common, newAccessToken);

                // Thực hiện gọi lại tất cả các API 401 đang chờ trong hàng đợi
                processQueue(null, newAccessToken);

                // Thực hiện gọi lại chính request ban đầu đã kích hoạt refresh
                setAuthHeader(originalRequest.headers, newAccessToken);
                return httpClient(originalRequest);
            } catch (refreshErr) {
                // Refresh thất bại: từ chối các request chờ, xóa token và chuyển hướng về /login
                processQueue(refreshErr, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                redirectToLogin();
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
