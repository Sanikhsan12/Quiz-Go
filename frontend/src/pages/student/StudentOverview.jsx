import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';

const StudentOverview = () => {
  const { user } = useOutletContext();

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Siswa</h1>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Halo, {user.name}!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Siap untuk belajar dan menguji pengetahuanmu hari ini?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-2xl transition-all border-t-4 border-t-indigo-500">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
            <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Daftar Kuis</h3>
            <p className="text-sm text-gray-500 mt-1">Lihat dan kerjakan kuis yang tersedia.</p>
          </div>
          <Link to="/dashboard/quizzes" className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors w-full">
            Mulai Kuis
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-2xl transition-all border-t-4 border-t-pink-500">
          <div className="bg-pink-100 dark:bg-pink-900/30 p-4 rounded-full">
            <Clock className="h-8 w-8 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Riwayat Nilai</h3>
            <p className="text-sm text-gray-500 mt-1">Cek hasil ujian dan status remedialmu.</p>
          </div>
          <Link to="/dashboard/history" className="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors w-full">
            Lihat Riwayat
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
