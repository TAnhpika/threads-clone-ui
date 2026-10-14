import { createSlice } from "@reduxjs/toolkit";
import userAvatar from "@/assets/images/ava.png";

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
            state.currentUser = {
                ...defaultUser,
                ...action.payload.user,
                avatar: userAvatar,
            };
            state.isAuthenticated = true;
            state.error = null;
            if (action.payload.accessToken) {
                localStorage.setItem("accessToken", action.payload.accessToken);
            }
            if (action.payload.refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    action.payload.refreshToken,
                );
            }
        },
        logout: (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
            state.error = null;
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
        builder.addCase("persist/REHYDRATE", (state, action) => {
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
