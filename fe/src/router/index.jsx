import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// ---- AUTH ----
import AuthPage from '../pages/Auth/AuthPage';

// ---- PUBLIC / GUEST ----
import HomePage from '../pages/Public/HomePage';
import CourseList from '../pages/Public/CourseList';
import CourseDetail from '../pages/Public/CourseDetail';

// ---- STUDENT ----
import StudentDashboard from '../pages/Student/StudentDashboard';
import MyCourses from '../pages/Student/MyCourses';

const I = {
  Student: () => <span>🎓</span>,
  Course: () => <span>📚</span>,
  Instructor: () => <span>🏫</span>,
  Plus: () => <span>➕</span>,
  Admin: () => <span>👑</span>,
  Users: () => <span>👥</span>,
  Categories: () => <span>📁</span>,
};

export default function AppRouter() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
      </Route>

      {/* 2. AUTH ROUTE */}
      <Route path="/auth" element={<AuthPage />} />

      {/* 3. STUDENT DASHBOARD */}
      <Route element={
        <ProtectedRoute roles={['student', 'admin', 'instructor']}>
          <DashboardLayout title="Học Viên" sidebarLinks={[
            { path: '/student/dashboard', label: 'Tổng quan', icon: <I.Student /> },
            { path: '/student/my-courses', label: 'Khoá học của tôi', icon: <I.Course /> },
          ]} />
        </ProtectedRoute>
      }>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/my-courses" element={<MyCourses />} />
      </Route>
      
      {/* HOME → redirect to /auth for now */}
      {/*<Route path="/" element={<Navigate to="/auth" replace />} />

      {/* PROTECTED PLACEHOLDER (demonstrates ProtectedRoute works) */}
      {/*<Route path="/dashboard" element={
        <ProtectedRoute>
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
            <h1 className="text-3xl font-bold mb-4">🎉 Đăng nhập thành công!</h1>
            <p className="text-slate-400">Bạn đã xác thực thành công. Module Auth hoạt động tốt.</p>
          </div>
        </ProtectedRoute>
      } />

      {/* Redirect shortcuts for role-based redirects from AuthPage/LoginForm */}
      <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/instructor/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/instructor/pending" element={<Navigate to="/dashboard" replace />} />

      {/* UNAUTHORIZED */}
      <Route path="/unauthorized" element={
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
          <h1 className="text-3xl font-bold mb-4">403 TỪ CHỐI</h1>
          <p className="text-slate-400">Bạn không có quyền truy cập trang này.</p>
        </div>
      } />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
