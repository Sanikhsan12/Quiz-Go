import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import DashboardRouter from './pages/DashboardRouter';
import AdminUsers from './pages/admin/AdminUsers';
import QuizRouter from './pages/QuizRouter';
import TeacherQuizDetail from './pages/teacher/TeacherQuizDetail';
import StudentQuizTake from './pages/student/StudentQuizTake';
import StudentHistory from './pages/student/StudentHistory';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[hsl(var(--background))] to-[#e0e7ff] dark:from-[#0a0f1d] dark:to-[#172033]">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 min-h-screen">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardRouter />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="quizzes" element={<QuizRouter />} />
              <Route path="quizzes/:quizId" element={<TeacherQuizDetail />} />
              <Route path="take-quiz/:quizId" element={<StudentQuizTake />} />
              <Route path="history" element={<StudentHistory />} />
            </Route>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
