import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// ---- AUTH ----
import AuthPage from '../pages/Auth/AuthPage';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';

// ---- PUBLIC / GUEST ----
import HomePage from '../pages/Public/HomePage';
import CourseList from '../pages/Public/CourseList';
import CourseDetail from '../pages/Public/CourseDetail';

// ---- STUDENT ----
import StudentDashboard from '../pages/Student/StudentDashboard';
import MyCourses from '../pages/Student/MyCourses';
import ProfilePage from '../pages/Student/ProfilePage';
import LearningPage from '../pages/Student/LearningPage';


// ---- INSTRUCTOR ----
import InstructorDashboard from '../pages/Instructor/InstructorDashboard';
import CreateCourse from '../pages/Instructor/CreateCourse';
import EditCourse from '../pages/Instructor/EditCourse';
import PendingApproval from '../pages/Instructor/PendingApproval';

// ---- ADMIN ----
import AdminDashboard from '../pages/Admin/AdminDashboard';
import ManageUsers from '../pages/Admin/ManageUsers';
import ManageInstructors from '../pages/Admin/ManageInstructors';
import ManageCategories from '../pages/Admin/ManageCategories';
import AdminCourseReview from '../pages/Admin/AdminCourseReview';

// ---- ICONS ----
const I = {
  Student: () => <span>🎓</span>,
  Course: () => <span>📚</span>,
  Instructor: () => <span>🏫</span>,
  Plus: () => <span>➕</span>,
  Admin: () => <span>👑</span>,
  Users: () => <span>👥</span>,
  Categories: () => <span>📁</span>,
  Profile: () => <span>👤</span>,

};

export default function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC ROUTES w/ Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
      </Route>

      {/* AUTH ROUTE */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* STUDENT DASHBOARD */}
      <Route element={<ProtectedRoute roles={['student', 'admin', 'instructor']}><DashboardLayout title="Học Viên" sidebarLinks={[
        { path: '/student/dashboard', label: 'Tổng quan', icon: <I.Student /> },
        { path: '/student/my-courses', label: 'Khoá học của tôi', icon: <I.Course /> },

        { path: '/student/profile', label: 'Hồ sơ cá nhân', icon: <I.Profile /> },
      ]} /></ProtectedRoute>}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/my-courses" element={<MyCourses />} />
        <Route path="/student/profile" element={<ProfilePage />} />
        <Route path="/student/learning/:courseId" element={<LearningPage />} />
      </Route>

      {/* INSTRUCTOR DASHBOARD */}
      <Route element={<ProtectedRoute roles={['instructor', 'admin']} requireApproved><DashboardLayout title="Giảng Viên" sidebarLinks={[
        { path: '/instructor/dashboard', label: 'Quản lý khoá học', icon: <I.Instructor /> },
        { path: '/instructor/create-course', label: 'Tạo khoá học mới', icon: <I.Plus /> },
      ]} /></ProtectedRoute>}>
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/create-course" element={<CreateCourse />} />
        <Route path="/instructor/edit-course/:id" element={<EditCourse />} />
      </Route>

      {/* INSTRUCTOR - PENDING */}
      <Route path="/instructor/pending" element={<ProtectedRoute roles={['instructor']}><PendingApproval /></ProtectedRoute>} />

      {/* ADMIN DASHBOARD */}
      <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout title="Quản Trị Hệ Thống" sidebarLinks={[
        { path: '/admin/dashboard', label: 'Tổng quan', icon: <I.Admin /> },
        { path: '/admin/users', label: 'Người dùng', icon: <I.Users /> },
        { path: '/admin/instructors', label: 'Phê duyệt GV', icon: <I.Instructor /> },
        { path: '/admin/courses-review', label: 'Duyệt khoá học', icon: <I.Course /> },
        { path: '/admin/categories', label: 'Danh mục', icon: <I.Categories /> },
      ]} /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/instructors" element={<ManageInstructors />} />
        <Route path="/admin/courses-review" element={<AdminCourseReview />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
      </Route>

      {/* FALLBACK */}
      <Route path="/unauthorized" element={
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
          <h1 className="text-3xl font-bold mb-4">403 TỪ CHỐI</h1>
          <p className="text-slate-400">Bạn không có quyền truy cập trang này.</p>
        </div>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes >
  );
}
