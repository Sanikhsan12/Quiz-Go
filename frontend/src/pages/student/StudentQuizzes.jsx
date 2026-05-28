import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { FileText, Clock, PlayCircle, Search } from 'lucide-react';

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      // Based on typical student API pattern, might be /student/quizzes
      const res = await api.get('/student/quizzes', { params });
      setQuizzes(res.data.data.quizzes || []);
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
      // Fallback data structure in case backend isn't ready
      if (err.response?.status === 404) {
        console.warn("Endpoint not found, backend might need update.");
      }
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

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Kuis Tersedia</h1>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Cari kuis berdasarkan judul atau topik..."
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
            <p className="text-gray-500">Belum ada kuis yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="glass border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-xl transition-all flex flex-col group border-t-4 border-t-indigo-500">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{quiz.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">{quiz.description}</p>
                
                <div className="flex items-center justify-between text-sm mb-5">
                  <span className="flex items-center font-medium text-gray-700 dark:text-gray-300">
                    <Clock size={16} className="mr-1.5 text-indigo-500" />
                    {quiz.time_limit_minutes} Menit
                  </span>
                  <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-xs font-semibold">
                    {quiz.topic}
                  </span>
                </div>
                
                <button
                  onClick={() => navigate(`/dashboard/take-quiz/${quiz.id}`)}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                >
                  <PlayCircle size={18} className="mr-2" />
                  Mulai Kerjakan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizzes;
