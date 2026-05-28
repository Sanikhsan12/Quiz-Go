import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import AdminOverview from './admin/AdminOverview';
import TeacherOverview from './teacher/TeacherOverview';
import StudentOverview from './student/StudentOverview';

const DashboardRouter = () => {
  const { user } = useOutletContext();

  if (user.role === 'admin') {
    return <AdminOverview />;
  } else if (user.role === 'teacher') {
    return <TeacherOverview />;
  } else if (user.role === 'student') {
    return <StudentOverview />;
  }

  return <Navigate to="/login" replace />;
};

export default DashboardRouter;
