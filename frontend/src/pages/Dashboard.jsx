import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, User } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 font-bold text-xl text-gray-900 dark:text-white">QuizGo Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">{user.name} ({user.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Selamat Datang, {user.name}!
          </h1>
          
          {user.role === 'teacher' && !user.is_approved && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Akun Anda sedang menunggu persetujuan dari Admin. Anda belum bisa membuat kuis.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Silakan pilih menu di samping (yang akan segera diimplementasikan) untuk mulai menggunakan platform.
            </p>
            {/* Future implementation: Sidebar and Routing for specific role features */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
