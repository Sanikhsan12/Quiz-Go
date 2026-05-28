import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Clock, CheckCircle } from 'lucide-react';

const StudentQuizTake = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initQuiz = async () => {
      try {
        setLoading(true);
        // Start or resume session
        const sessionRes = await api.post(`/student/quizzes/${quizId}/start`);
        setSession(sessionRes.data.data.session);
        setQuiz(sessionRes.data.data.quiz);
        
        // Calculate remaining time
        const startedAt = new Date(sessionRes.data.data.session.started_at).getTime();
        const now = new Date().getTime();
        const limitMs = sessionRes.data.data.quiz.time_limit_minutes * 60 * 1000;
        const elapsed = now - startedAt;
        const remaining = Math.max(0, Math.floor((limitMs - elapsed) / 1000));
        
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          handleSubmitQuiz(sessionRes.data.data.session.id, true);
        }
      } catch (err) {
        alert('Gagal memulai kuis atau sesi sudah selesai.');
        navigate('/dashboard/quizzes');
      } finally {
        setLoading(false);
      }
    };
    initQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz(session?.id, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, submitting, session]);

  const handleSelectOption = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = async (sessionId, autoSubmit = false) => {
    if (!autoSubmit && !window.confirm('Yakin ingin menyelesaikan kuis ini? Jawaban tidak dapat diubah lagi.')) return;
    
    setSubmitting(true);
    try {
      // Format answers to match backend requirement
      const answerData = Object.entries(answers).map(([qId, optId]) => ({
        question_id: qId,
        selected_option_id: optId
      }));

      await api.post(`/student/sessions/${sessionId || session.id}/submit`, {
        answers: answerData
      });
      
      alert(autoSubmit ? 'Waktu habis! Kuis otomatis disubmit.' : 'Kuis berhasil disubmit!');
      navigate('/dashboard/history');
    } catch (err) {
      alert('Gagal submit kuis.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        <p className="text-gray-500 font-medium animate-pulse">Menyiapkan kuis...</p>
      </div>
    );
  }

  if (!quiz) return null;

  const isWarningTime = timeLeft < 60; // less than 1 minute

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2">
      {/* Sticky Header with Timer */}
      <div className="sticky top-16 z-40 glass-card rounded-2xl p-5 shadow-xl border-t-4 border-t-indigo-600 flex justify-between items-center transition-all mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{quiz.title}</h1>
          <p className="text-sm text-gray-500">Jawablah semua pertanyaan sebelum waktu habis.</p>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-xl font-mono text-xl font-bold transition-colors ${
          isWarningTime 
            ? 'bg-red-100 text-red-600 animate-pulse' 
            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
        }`}>
          <Clock className="mr-2" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {quiz.questions?.map((q, qIndex) => (
          <div key={q.id} className="glass border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 mr-4 text-lg">
                {qIndex + 1}
              </span>
              {q.question_text}
            </h3>
            <div className="space-y-4 ml-14">
              {q.options?.map(opt => (
                <label 
                  key={opt.id} 
                  className={`flex items-center p-5 rounded-xl border cursor-pointer transition-all ${
                    answers[q.id] === opt.id 
                      ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-600 shadow-md ring-2 ring-indigo-500/50' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => handleSelectOption(q.id, opt.id)}
                    className="w-6 h-6 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className={`ml-4 text-lg ${answers[q.id] === opt.id ? 'font-semibold text-indigo-900 dark:text-indigo-200' : 'text-gray-800 dark:text-gray-200'}`}>
                    {opt.option_text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 pb-20">
        <button
          onClick={() => handleSubmitQuiz(session.id, false)}
          disabled={submitting}
          className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {submitting ? 'Menyimpan...' : 'Submit Kuis'}
          {!submitting && <CheckCircle className="ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default StudentQuizTake;
