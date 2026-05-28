import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const TeacherOverview = () => {
  const { user } = useOutletContext();

  if (!user.is_approved) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Guru</h1>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-6 rounded-r-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Menunggu Persetujuan</h2>
          <p className="text-yellow-700 dark:text-yellow-300">
            Akun Anda saat ini sedang menunggu persetujuan dari Administrator. Anda belum bisa membuat atau mengelola kuis sampai akun disetujui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Guru</h1>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Selamat Datang, {user.name}!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola kuis Anda dan lihat perkembangan siswa Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-2xl transition-all">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
            <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Kuis Saya</h3>
            <p className="text-sm text-gray-500 mt-1">Buat, edit, dan publikasikan kuis untuk siswa.</p>
          </div>
          <Link to="/dashboard/quizzes" className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors w-full">
            Kelola Kuis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverview;
