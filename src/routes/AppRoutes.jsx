import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import AuthLayout from "@/layouts/AuthLayout";
import PrivateRoute from "@/components/PrivateRoute";

// Code Splitting / Lazy Loading các Pages
const HomePage = lazy(() => import("@/pages/Home"));
const PostDetailPage = lazy(() => import("@/pages/PostDetail"));
const MessagesPage = lazy(() => import("@/pages/Messages"));
const ActivityPage = lazy(() => import("@/pages/Activity"));
const InsightsPage = lazy(() => import("@/pages/Insights"));
const SearchPage = lazy(() => import("@/pages/Search"));
const ProfilePage = lazy(() => import("@/pages/Profile"));
const LoginPage = lazy(() => import("@/pages/Auth/Login"));
const RegisterPage = lazy(() => import("@/pages/Auth/Register"));
const ForgotPasswordPage = lazy(() => import("@/pages/Auth/ForgotPassword"));
const VerifyEmailPage = lazy(() => import("@/pages/Auth/VerifyEmail"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-75">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin dark:border-zinc-700 dark:border-t-white" />
        </div>
    );
}

export default function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public Routes với DefaultLayout */}
                <Route element={<DefaultLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/custom_feed/create" element={<HomePage defaultCreateFeedOpen={true} />} />
                    <Route path="/@:username/post/:postId" element={<PostDetailPage />} />
                    <Route path="/:username/post/:postId" element={<PostDetailPage />} />
                    <Route path="/post/:postId" element={<PostDetailPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/activity" element={<ActivityPage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* Protected Routes cần đăng nhập */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/@:username" element={<ProfilePage />} />
                    </Route>
                </Route>

                {/* Auth Routes với AuthLayout */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                </Route>

                {/* 404 Not Found Route */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}
