import { Outlet } from 'react-router-dom';

/**
 * Layout Embed tối giản dành riêng cho việc nhúng trong thẻ iframe.
 * Không có Sidebar, TopBar, Navigation, Footer hay LoginPanel.
 * Đảm bảo nền trắng tinh khiết, full-width, căn giữa và hoàn toàn responsive.
 */
export default function EmbedLayout() {
  return (
    <div className="w-full min-h-full bg-white text-black flex flex-col justify-center items-center p-2 sm:p-3 selection:bg-zinc-200 selection:text-black">
      <main className="w-full max-w-[540px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
