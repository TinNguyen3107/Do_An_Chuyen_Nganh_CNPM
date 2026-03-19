import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// ---- AUTH ----
import AuthPage from '../pages/Auth/AuthPage';

// ---- LAYOUT ----
import DashboardLayout from '../layout/Dashboardlayout';

// ---- ADMIN ----
import AdminDashboard from '../pages/Admin/AdminDashboard';
import ManageUsers from '../pages/Admin/ManageUsers';

export default function AppRouter() {
  return (
    <Routes>
      {/* AUTH ROUTE */}
      <Route path="/auth" element={<AuthPage />} />

      {/* HOME → redirect to /auth for now */}
      <Route path="/" element={<Navigate to="/auth" replace />} />

      {/* PROTECTED PLACEHOLDER (demonstrates ProtectedRoute works) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
            <h1 className="text-3xl font-bold mb-4">🎉 Đăng nhập thành công!</h1>
            <p className="text-slate-400">Bạn đã xác thực thành công. Module Auth hoạt động tốt.</p>
          </div>
        </ProtectedRoute>
      } />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
      </Route>

      {/* Redirect shortcuts for role-based redirects from AuthPage/LoginForm */}
      <Route path="/instructor/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/instructor/pending" element={<Navigate to="/dashboard" replace />} />
      <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />

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
