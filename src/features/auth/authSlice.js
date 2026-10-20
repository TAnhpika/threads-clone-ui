import { createSlice } from "@reduxjs/toolkit";
import userAvatar from "@/assets/images/default-avatar.svg";
import { getCurrentUser } from "@/services/authService";

const defaultUser = {
    id: "1",
    name: "Tuan Anh",
    username: "tuananhpika",
    email: "tuananhpika@threads.net",
    avatar: userAvatar,
    bio: "",
    followers: 0,
};

const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken"));

const initialState = {
    currentUser: hasToken ? defaultUser : null,
    isAuthenticated: hasToken,
    fetching: false,
    error: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const user = action.payload?.user || action.payload?.data || action.payload;
            state.currentUser = {
                ...defaultUser,
                ...user,
                avatar: user?.avatar || userAvatar,
            };
            state.isAuthenticated = true;
            state.error = null;
            state.fetching = false;
            if (action.payload?.accessToken || action.payload?.access_token) {
                localStorage.setItem(
                    "accessToken",
                    action.payload.accessToken || action.payload.access_token
                );
            }
            if (action.payload?.refreshToken || action.payload?.refresh_token) {
                localStorage.setItem(
                    "refreshToken",
                    action.payload.refreshToken || action.payload.refresh_token
                );
            }
            const username = user?.username || user?.name;
            if (username && typeof window !== "undefined") {
                try {
                    localStorage.setItem("threads_last_username", username);
                    const existingRaw = localStorage.getItem("threads_last_login_account");
                    const existing = existingRaw ? JSON.parse(existingRaw) : {};
                    localStorage.setItem(
                        "threads_last_login_account",
                        JSON.stringify({
                            ...existing,
                            username,
                            name: user?.name || username,
                            avatar: user?.avatar_url || user?.avatar || null,
                        })
                    );
                } catch (_) {}
            }
        },
        logout: (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
            state.error = null;
            state.fetching = false;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
        setFetching: (state, action) => {
            state.fetching = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        updateCurrentUser: (state, action) => {
            state.currentUser = { ...state.currentUser, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            // Xử lý API "Get User Info"
            .addCase(getCurrentUser.pending, (state) => {
                state.fetching = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                const user = action.payload?.user || action.payload?.data || action.payload;
                state.currentUser = {
                    ...defaultUser,
                    ...user,
                    avatar: user?.avatar || userAvatar,
                };
                state.isAuthenticated = true;
                state.fetching = false;
                state.error = null;
                const username = user?.username || user?.name;
                if (username && typeof window !== "undefined") {
                    try {
                        localStorage.setItem("threads_last_username", username);
                        const existingRaw = localStorage.getItem("threads_last_login_account");
                        const existing = existingRaw ? JSON.parse(existingRaw) : {};
                        localStorage.setItem(
                            "threads_last_login_account",
                            JSON.stringify({
                                ...existing,
                                username,
                                name: user?.name || username,
                                avatar: user?.avatar_url || user?.avatar || null,
                            })
                        );
                    } catch (_) {}
                }
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.fetching = false;
                state.error = action.payload;
                state.currentUser = null;
                state.isAuthenticated = false;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            })
            // Xử lý redux-persist rehydrate
            .addCase("persist/REHYDRATE", (state, action) => {
                if (action.payload?.auth?.currentUser && action.payload?.auth?.isAuthenticated) {
                    state.currentUser = {
                        ...defaultUser,
                        ...action.payload.auth.currentUser,
                        avatar: userAvatar,
                    };
                    state.isAuthenticated = true;
                } else if (action.payload?.auth?.isAuthenticated === false) {
                    state.currentUser = null;
                    state.isAuthenticated = false;
                }
            });
    },
});

export const {
    loginSuccess,
    logout,
    setFetching,
    setError,
    updateCurrentUser,
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => {
    if (!state.auth.isAuthenticated || !state.auth.currentUser) return null;
    const user = state.auth.currentUser;
    return {
        ...defaultUser,
        ...user,
        name: user.name && user.name !== "Alexander Vance" ? user.name : "Tuan Anh",
        username: user.username && user.username !== "alexander.sartorial" ? user.username : "tuananhpika",
        avatar: userAvatar,
    };
};
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthFetching = (state) => state.auth.fetching;

export default authSlice.reducer;
