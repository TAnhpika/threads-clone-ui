import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
            <div className="mb-6">
                <Link to="/" className="text-2xl font-black tracking-wider">
                    BaseApp
                </Link>
            </div>
            <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                <Outlet />
            </div>
        </div>
    );
}
