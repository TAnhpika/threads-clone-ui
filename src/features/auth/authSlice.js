import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    isAuthenticated: !!localStorage.getItem("accessToken"),
    fetching: false,
    error: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.currentUser = action.payload.user;
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
});

export const {
    loginSuccess,
    logout,
    setFetching,
    setError,
    updateCurrentUser,
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthFetching = (state) => state.auth.fetching;

export default authSlice.reducer;
