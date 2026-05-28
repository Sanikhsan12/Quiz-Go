import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const TeacherQuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { option_text: '', is_correct: true },
    { option_text: '', is_correct: false }
  ]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teacher/quizzes/${quizId}`);
      setQuiz(res.data.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/dashboard/quizzes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const togglePublish = async () => {
    if (quiz.status === 'published') {
      if (!window.confirm('Tarik kembali kuis ke draft?')) return;
      try {
        await api.patch(`/teacher/quizzes/${quizId}/unpublish`);
        fetchQuiz();
      } catch (err) {
        alert('Gagal unpublish kuis');
      }
    } else {
      try {
        await api.patch(`/teacher/quizzes/${quizId}/publish`);
        fetchQuiz();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal mempublikasikan kuis');
      }
    }
  };

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, { option_text: '', is_correct: false }]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      if (options[index].is_correct) {
        newOptions[0].is_correct = true;
      }
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].option_text = value;
    setOptions(newOptions);
  };

  const handleSetCorrect = (index) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index
    }));
    setOptions(newOptions);
  };

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionText(question.question_text);
      setOptions(question.options);
    } else {
      setEditingQuestion(null);
      setQuestionText('');
      setOptions([
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false }
      ]);
    }
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (options.some(o => !o.option_text.trim())) {
      return alert('Semua opsi jawaban harus diisi');
    }
    if (!options.some(o => o.is_correct)) {
      return alert('Pilih salah satu jawaban yang benar');
    }

    try {
      if (editingQuestion) {
        await api.put(`/teacher/quizzes/${quizId}/questions/${editingQuestion.id}`, {
          question_text: questionText,
          options
        });
      } else {
        await api.post(`/teacher/quizzes/${quizId}/questions`, {
          question_text: questionText,
          options
        });
      }
      setShowQuestionModal(false);
      fetchQuiz();
    } catch (err) {
      alert('Gagal menyimpan soal');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Yakin menghapus soal ini?')) return;
    try {
      await api.delete(`/teacher/quizzes/${quizId}/questions/${questionId}`);
      fetchQuiz();
    } catch (err) {
      alert('Gagal menghapus soal');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/dashboard/quizzes')}
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">{quiz.title}</h1>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border ${
            quiz.status === 'published' 
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' 
              : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
          }`}>
            {quiz.status.toUpperCase()}
          </span>
          <button
            onClick={togglePublish}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              quiz.status === 'published'
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {quiz.status === 'published' ? 'Tarik ke Draft' : 'Publish Kuis'}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Daftar Soal ({quiz.questions?.length || 0})</h2>
          {quiz.status === 'draft' && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Tambah Soal
            </button>
          )}
        </div>

        {(!quiz.questions || quiz.questions.length === 0) ? (
          <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 mb-2">Kuis ini belum memiliki soal.</p>
            {quiz.status === 'draft' && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={() => handleOpenModal()}>
                Klik di sini untuk mulai menambahkan soal
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white/50 dark:bg-gray-800/50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg flex-1">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">{idx + 1}.</span> 
                    {q.question_text}
                  </h3>
                  {quiz.status === 'draft' && (
                    <div className="flex space-x-2 ml-4">
                      <button onClick={() => handleOpenModal(q)} className="text-gray-500 hover:text-indigo-600 p-1">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-500 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, i) => (
                    <div key={opt.id} className={`p-3 rounded-lg border ${opt.is_correct ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                      <div className="flex items-start">
                        <div className={`mt-0.5 mr-2 flex-shrink-0 ${opt.is_correct ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          {opt.is_correct ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        </div>
                        <span className={`text-sm ${opt.is_correct ? 'font-medium text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'}`}>
                          {opt.option_text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQuestionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
            </h2>
            <form onSubmit={handleSaveQuestion} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pertanyaan</label>
                <textarea
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  placeholder="Tuliskan pertanyaan di sini..."
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilihan Jawaban (Min 2, Max 4)</label>
                  {options.length < 4 && (
                    <button type="button" onClick={handleAddOption} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                      + Tambah Opsi
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => handleSetCorrect(idx)}
                        className={`p-2 rounded-lg flex-shrink-0 transition-colors ${opt.is_correct ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300'}`}
                        title={opt.is_correct ? "Jawaban Benar" : "Jadikan Jawaban Benar"}
                      >
                        <CheckCircle size={20} />
                      </button>
                      <input
                        type="text"
                        required
                        value={opt.option_text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 px-4 py-2 border-none bg-transparent focus:ring-0 text-gray-900 dark:text-white"
                        placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <CheckCircle size={12} className="mr-1 inline text-green-500" /> Klik ikon centang untuk menandai jawaban yang benar.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md font-medium"
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizDetail;
