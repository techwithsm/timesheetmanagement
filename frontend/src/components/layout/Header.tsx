import { Menu, Sun, Moon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';
import NotificationBell from '../notifications/NotificationBell';
import { getInitials } from '../../utils/formatters';
import * as authService from '../../services/auth.service';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 gap-4">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        {user && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                {getInitials(user)}
              </div>
              <span className="hidden md:block text-gray-700 dark:text-gray-200 font-medium">
                {user.firstName}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              title="Logout"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
