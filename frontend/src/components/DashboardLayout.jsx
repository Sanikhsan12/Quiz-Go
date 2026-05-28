import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { User, Menu, Moon, Sun, X } from 'lucide-react';

const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
    
    // Theme init
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark' || (!currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, [navigate]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Navbar */}
      <nav className="glass border-b sticky top-0 z-50 h-16">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
              <div className="flex items-center font-black text-2xl tracking-tighter">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm">
                  QuizGo
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700 transition-all shadow-sm"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="hidden sm:flex items-center text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                <User className="h-4 w-4 mr-2 text-indigo-500" />
                <span className="font-medium text-sm">{user.name}</span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 w-full mx-auto max-w-[1920px] relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar wrapper for mobile slide-in */}
        <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-50 md:z-auto`}>
          <Sidebar user={user} onMenuClick={() => setIsMobileMenuOpen(false)} />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
