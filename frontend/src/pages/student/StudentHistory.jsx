import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Award, RefreshCw, XCircle, CheckCircle } from 'lucide-react';

const StudentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/sessions');
      setHistory(res.data.data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRemedial = (quizId) => {
    if (!window.confirm('Yakin ingin remedial? Batas maksimal nilai remedial adalah 70.')) return;
    navigate(`/dashboard/take-quiz/${quizId}`);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100 border-green-200';
      case 'AB': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'B': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'BC': return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      case 'C': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-red-600 bg-red-100 border-red-200'; // D
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat & Nilai</h1>

      <div className="glass-card rounded-2xl p-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Anda belum mengerjakan kuis apa pun.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((session) => (
              <div key={session.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white/50 dark:bg-gray-800/50 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-bold text-lg">{session.quiz?.title || 'Kuis Tidak Diketahui'}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      Attempt #{session.attempt_number}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Disubmit pada: {new Date(session.ended_at).toLocaleString('id-ID')}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <CheckCircle size={16} className="mr-1" /> Benar: {session.correct_answers}
                    </div>
                    <div className="flex items-center text-red-600">
                      <XCircle size={16} className="mr-1" /> Salah: {session.total_questions - session.correct_answers}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end md:w-1/3 space-x-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Skor</div>
                    <div className="text-2xl font-black">{session.score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Grade</div>
                    <div className={`text-xl font-bold px-3 py-1 rounded-lg border ${getGradeColor(session.grade)}`}>
                      {session.grade}
                    </div>
                  </div>
                </div>

                {session.can_remedial && (
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    <button
                      onClick={() => handleRemedial(session.quiz_id)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      <RefreshCw size={16} className="mr-1.5" />
                      Remedial
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHistory;
