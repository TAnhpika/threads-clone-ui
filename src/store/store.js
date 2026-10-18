import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storageModule from "redux-persist/lib/storage";
import authReducer from "@/features/auth/authSlice";
import feedReducer from "@/features/feed/feedSlice";

// Khắc phục tương thích ESM của Vite với redux-persist (tránh lỗi TypeError: storage.getItem is not a function)
const storage = storageModule.default ?? storageModule;

// Cấu hình riêng cho Auth Slice
const authPersistConfig = {
    key: "auth",
    storage,
    blacklist: ["fetching", "error"], // KHÔNG persist trạng thái loading/fetching
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    feed: feedReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Bắt buộc tắt check serializable để tương thích redux-persist
        }),
});

export const persistor = persistStore(store);
