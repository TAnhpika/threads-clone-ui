import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <main className="min-h-screen w-full bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-zinc-800 selection:text-white">
            <Outlet />
        </main>
    );
}
