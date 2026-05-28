import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Plus, Edit2, Trash2, Eye, FileText, Search, Clock } from 'lucide-react';

const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedQuizResults, setSelectedQuizResults] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', topic: '', time_limit_minutes: 30 });
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const res = await api.get('/teacher/quizzes', { params });
      setQuizzes(res.data.data.quizzes || []);
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuizzes();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/teacher/quizzes', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', topic: '', time_limit_minutes: 30 });
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat kuis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kuis ini beserta soal-soalnya?')) return;
    try {
      await api.delete(`/teacher/quizzes/${id}`);
      fetchQuizzes();
    } catch (err) {
      alert('Gagal menghapus kuis.');
    }
  };

  const handleViewResults = async (quiz) => {
    setSelectedQuizTitle(quiz.title);
    setShowResultsModal(true);
    setIsLoadingResults(true);
    try {
      const res = await api.get(`/teacher/quizzes/${quiz.id}/results`);
      setSelectedQuizResults(res.data.data || []);
    } catch (err) {
      alert('Gagal mengambil data nilai siswa.');
      setShowResultsModal(false);
    } finally {
      setIsLoadingResults(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Kuis</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus size={20} className="mr-2" />
          Buat Kuis Baru
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Cari judul kuis atau topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada kuis yang dibuat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="glass border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    quiz.status === 'published' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {quiz.status.toUpperCase()}
                  </span>
                  <div className="flex space-x-1">
                    {quiz.status === 'published' && (
                      <button 
                        onClick={() => handleViewResults(quiz)}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                        title="Lihat Nilai Siswa"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/dashboard/quizzes/${quiz.id}`)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="Detail & Edit Soal"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(quiz.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Hapus Kuis"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{quiz.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">{quiz.description || 'Tidak ada deskripsi'}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {quiz.time_limit_minutes} Menit
                  </span>
                  <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                    {quiz.topic}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Buat Kuis Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Kuis</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topik</label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={e => setFormData({...formData, topic: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batas Waktu (Menit)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.time_limit_minutes}
                    onChange={e => setFormData({...formData, time_limit_minutes: parseInt(e.target.value) || 30})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kuis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResultsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nilai Siswa: {selectedQuizTitle}</h2>
              <button
                onClick={() => setShowResultsModal(false)}
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {isLoadingResults ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : selectedQuizResults.length === 0 ? (
                <div className="text-center p-8 text-gray-500">Belum ada siswa yang mengerjakan kuis ini.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-4 py-3 rounded-tl-lg">Nama Siswa</th>
                      <th scope="col" className="px-4 py-3 text-center">Nilai Akhir</th>
                      <th scope="col" className="px-4 py-3 text-center rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuizResults.map((result, idx) => (
                      <tr key={idx} className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{result.student_name}</td>
                        <td className="px-4 py-3 text-center font-bold">{Math.round(result.score * 10) / 10}</td>
                        <td className="px-4 py-3 text-center">
                          {result.is_remedial ? (
                            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-amber-900 dark:text-amber-300">Remedial</span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-emerald-900 dark:text-emerald-300">Pertama</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes;
