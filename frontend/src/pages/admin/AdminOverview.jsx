import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';

const AdminOverview = () => {
  const { user } = useOutletContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Selamat Datang, {user.name}!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Anda login sebagai Administrator. Gunakan menu di sidebar untuk mengelola pengguna.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-2xl transition-all">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
            <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Manajemen User</h3>
            <p className="text-sm text-gray-500 mt-1">Kelola data siswa dan guru terdaftar.</p>
          </div>
          <Link to="/dashboard/users" className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors w-full">
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
