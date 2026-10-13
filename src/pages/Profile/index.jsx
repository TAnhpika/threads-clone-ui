import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="p-6 border rounded-2xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 space-y-4">
      <h2 className="text-2xl font-bold">Trang Hồ Sơ Cá Nhân (Protected Route) 🔒</h2>
      <p className="text-sm text-gray-500">Chỉ người dùng đã đăng nhập mới có thể xem trang này.</p>
      <div className="p-4 rounded-lg bg-gray-100 dark:bg-zinc-800 font-mono text-sm">
        {JSON.stringify(user, null, 2)}
      </div>
    </div>
  );
}
