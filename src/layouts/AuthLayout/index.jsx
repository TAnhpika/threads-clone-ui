import { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import threadsLoginBg from "@/assets/images/threads-login-bg.webp";

export default function AuthLayout() {
  // Luôn hiện sẵn thanh cuộn để các trang Auth không bị giật khi mount/lỗi xuất hiện
  useEffect(() => {
    document.documentElement.classList.add("overflow-y-scroll");
    return () => {
      document.documentElement.classList.remove("overflow-y-scroll");
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-white dark:bg-[#0a0a0a] text-black dark:text-white overflow-x-hidden selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white select-none px-4 py-6 transition-colors duration-200">
      {/* Background Threads */}
      <div className="absolute top-0 -mt-67 left-1/2 -translate-x-1/2 w-446.25 h-127.5 max-w-none pointer-events-none select-none z-0">
        <picture className="w-446.25 h-127.5 block">
          <source
            srcSet="https://static.cdninstagram.com/rsrc.php/ym/r/gf40BP6SRYU.avif"
            type="image/avif"
          />
          <source
            srcSet="https://static.cdninstagram.com/rsrc.php/yL/r/ZqRe_VCVa2A.webp"
            type="image/webp"
          />
          <img
            alt=""
            height="510"
            width="1785"
            src={threadsLoginBg}
            className="w-446.25 h-127.5 max-w-none object-contain pointer-events-none select-none"
          />
        </picture>
      </div>

      {/* Main Content (Trang con) */}
      <main className="w-full flex-1 flex flex-col justify-center items-center relative z-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full relative z-10 pt-8 pb-2">
        <div className="flex items-center justify-center gap-3.5 text-xs text-zinc-400 dark:text-zinc-600 font-normal flex-wrap">
          <span>© 2026</span>
          <Link to="/login" className="hover:underline">Threads Terms</Link>
          <Link to="/login" className="hover:underline">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
