import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <main className="min-h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white overflow-x-hidden selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white transition-colors duration-200">
            <Outlet />
        </main>
    );
}

