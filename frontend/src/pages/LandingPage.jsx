import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Target, ShieldCheck, ArrowRight, BookOpen, Clock, Users } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Brain size={24} />
            </div>
            <span className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              QuizGo
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-4 py-2"
            >
              Masuk
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <Sparkles size={16} className="mr-2" />
            Platform Kuis Edukasi Masa Kini
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-tight animate-in slide-in-from-bottom-6 duration-700 delay-100">
            Tingkatkan <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Pembelajaran</span><br className="hidden sm:block"/>
            Lewat Evaluasi Interaktif
          </h1>
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-10 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            QuizGo memudahkan guru dalam membuat kuis dan membantu siswa belajar melalui latihan soal interaktif dengan analisis nilai otomatis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-1 flex items-center justify-center group"
            >
              Mulai Sekarang
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Fitur Unggulan QuizGo</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Dirancang khusus untuk mendukung kegiatan belajar mengajar agar lebih efektif dan menyenangkan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 flex items-center justify-center mb-6">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Manajemen Kuis</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Guru dapat dengan mudah membuat, mengedit, dan mempublikasikan kuis lengkap dengan batas waktu pengerjaan.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Auto Grading</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Hasil jawaban siswa dinilai secara instan. Sistem otomatis mengkalkulasi skor dan memberikan Grade (A-D).
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Sistem Remedial</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Siswa yang belum mencapai nilai minimum diberikan kesempatan mengulang kuis satu kali secara terstruktur.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Aman & Terkendali</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Admin dapat memonitor seluruh user, menyetujui akun guru baru, dan menjaga kualitas platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-white/20 dark:bg-black/20 backdrop-blur-lg">
        <p>© 2026 QuizGo Platform Edukasi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
