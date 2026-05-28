import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Users, UserCheck, BookOpen, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import api from '../../lib/api';

const AdminOverview = () => {
  const { user } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/stats');
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
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
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
          Anda login sebagai Administrator. Pantau statistik platform dan kelola pengguna di sini.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card: Total Siswa */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full shadow-inner">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Siswa</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total_students}</h3>
              </div>
            </div>

            {/* Card: Total Guru */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full shadow-inner">
                <UserCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Guru</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total_teachers}</h3>
              </div>
            </div>

            {/* Card: Total Kuis */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="bg-fuchsia-100 dark:bg-fuchsia-900/30 p-4 rounded-full shadow-inner">
                <BookOpen className="h-8 w-8 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Kuis Dibuat</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total_quizzes}</h3>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-indigo-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performa Guru</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-4 rounded-tl-lg">Nama Guru</th>
                    <th scope="col" className="px-6 py-4 text-center">Total Kuis Dibuat</th>
                    <th scope="col" className="px-6 py-4 text-center rounded-tr-lg">Rata-rata Nilai Siswa</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.teacher_stats && stats.teacher_stats.length > 0 ? (
                    stats.teacher_stats.map((teacher, index) => (
                      <tr key={index} className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {teacher.teacher_name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                            {teacher.total_quizzes}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold">
                          {Math.round(teacher.average_score * 10) / 10}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        Belum ada data statistik performa guru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminOverview;
