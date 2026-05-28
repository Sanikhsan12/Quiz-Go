import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { BookOpen, Users, AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

const TeacherOverview = () => {
  const { user } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/teacher/stats');
      if (response.data?.status === 'success') {
        setStats(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat statistik. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.is_approved) {
      fetchStats();
    }
  }, [user.is_approved]);

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
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Refresh Statistik"
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Selamat Datang, {user.name}!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola kuis Anda dan lihat perkembangan siswa Anda di sini.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card: Total Kuis */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full shadow-inner">
              <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Kuis</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total_quizzes}</h3>
            </div>
          </div>

          {/* Card: Total Pengerjaan */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full shadow-inner">
              <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Pengerjaan</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total_sessions}</h3>
            </div>
          </div>

          {/* Card: Total Remedial */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full shadow-inner">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Siswa Remedial</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total_remedial}</h3>
            </div>
          </div>

          {/* Card: Rata-rata Nilai */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="bg-violet-100 dark:bg-violet-900/30 p-4 rounded-full shadow-inner">
              <BarChart3 className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Rata-rata Nilai</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {Math.round(stats.average_score * 10) / 10}
              </h3>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-lg transition-all border border-indigo-100 dark:border-indigo-900/50">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
            <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Kelola Kuis</h3>
            <p className="text-sm text-gray-500 mt-1">Buat, edit, dan publikasikan kuis baru untuk siswa.</p>
          </div>
          <Link to="/dashboard/quizzes" className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors w-full shadow-md hover:shadow-lg">
            Masuk ke Manajemen Kuis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverview;
