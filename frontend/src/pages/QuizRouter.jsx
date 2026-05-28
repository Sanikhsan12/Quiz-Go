import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import TeacherQuizzes from './teacher/TeacherQuizzes';
import StudentQuizzes from './student/StudentQuizzes';

const QuizRouter = () => {
  const { user } = useOutletContext();

  if (user.role === 'teacher') {
    return <TeacherQuizzes />;
  } else if (user.role === 'student') {
    return <StudentQuizzes />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default QuizRouter;
