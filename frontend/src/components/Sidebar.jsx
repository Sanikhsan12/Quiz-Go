import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText,
  LogOut,
  Clock,
  Settings
} from 'lucide-react';

const Sidebar = ({ user, onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getLinksByRole = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
          { to: '/dashboard/users', icon: <Users size={20} />, label: 'Manajemen User' },
        ];
      case 'teacher':
        return [
          { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
          { to: '/dashboard/quizzes', icon: <BookOpen size={20} />, label: 'Kuis Saya' },
        ];
      case 'student':
        return [
          { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
          { to: '/dashboard/quizzes', icon: <FileText size={20} />, label: 'Daftar Kuis' },
          { to: '/dashboard/history', icon: <Clock size={20} />, label: 'Riwayat & Nilai' },
        ];
      default:
        return [];
    }
  };

  const links = getLinksByRole();

  return (
    <aside className="w-64 flex-shrink-0 glass border-r min-h-[calc(100vh-4rem)] md:sticky top-16 flex flex-col bg-white/90 dark:bg-gray-900/90 md:bg-white/40 md:dark:bg-gray-900/40 z-50">
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            onClick={onMenuClick}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none font-semibold text-[15px]' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800 text-[15px] font-medium'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
