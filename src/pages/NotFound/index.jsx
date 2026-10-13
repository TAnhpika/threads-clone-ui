import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black mb-2">404</h1>
      <p className="text-gray-500 mb-6">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <Link
        to="/"
        className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}
