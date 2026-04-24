import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CalendarCheck, Calendar, BarChart3, Settings, X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/teachers', icon: GraduationCap, label: 'Teachers' },
  { to: '/classes', icon: BookOpen, label: 'Classes' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/holidays', icon: Calendar, label: 'Holidays' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 flex flex-col
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 shadow-sm
          ${isOpen ? 'w-64' : 'w-0 lg:w-16 overflow-hidden'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {isOpen && (
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
              🏫 SchoolAttend
            </span>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
