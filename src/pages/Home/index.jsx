import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { selectCurrentUser, logout } from '@/features/auth/authSlice';

export default function HomePage() {
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  return (
    <div className="space-y-6">
      <div className="p-8 border rounded-2xl bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{t('home.welcome')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('home.description')}</p>
      </div>

      {user ? (
        <div className="p-4 border rounded-xl border-green-200 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 flex items-center justify-between">
          {/* Truyền biến email vào chuỗi dịch qua Interpolation */}
          <span>{t('home.loggedInAs', { email: user.email })}</span>
          <button
            onClick={() => dispatch(logout())}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {t('nav.logout')}
          </button>
        </div>
      ) : (
        <div className="p-4 border rounded-xl border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300">
          {t('home.notLoggedIn')}
        </div>
      )}
    </div>
  );
}
