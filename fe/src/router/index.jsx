import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// ---- [THÀNH VIÊN 1] ----
import AuthPage from '../pages/Auth/AuthPage';

// ---- PUBLIC (Bạn đã copy) ----
import HomePage from '../pages/Public/HomePage';
import CourseList from '../pages/Public/CourseList';
import CourseDetail from '../pages/Public/CourseDetail';

// ---- [THÀNH VIÊN 4] - PHẦN VIỆC CỦA BẠN ----
import PendingApproval from '../pages/Instructor/PendingApproval';
import ManageInstructors from '../pages/Admin/ManageInstructors';
import ManageCategories from '../pages/Admin/ManageCategories';


// =========================================================================
// 🚀 THỦ THUẬT: TẠO PLACEHOLDER CHO CÁC TRANG CÒN THIẾU CỦA TEAM
// Khi nào người khác làm xong file thật, bạn chỉ việc xoá các dòng này 
// và dùng lệnh import bình thường. Giờ thì cứ để đây cho code khỏi lỗi!
// =========================================================================
const StudentDashboard = () => <div className="p-10 text-white text-xl">Trang Tổng quan Học viên (Đang phát triển...)</div>;
const MyCourses = () => <div className="p-10 text-white text-xl">Khoá học của tôi (Đang phát triển...)</div>;
const InstructorDashboard = () => <div className="p-10 text-white text-xl">Tổng quan Giảng viên (Đang phát triển...)</div>;
const CreateCourse = () => <div className="p-10 text-white text-xl">Tạo khoá học (Đang phát triển...)</div>;
const EditCourse = () => <div className="p-10 text-white text-xl">Chỉnh sửa khoá học (Đang phát triển...)</div>;
const AdminDashboard = () => <div className="p-10 text-white text-xl">Tổng quan Admin (Đang phát triển...)</div>;
const ManageUsers = () => <div className="p-10 text-white text-xl">Quản lý Người dùng (Đang phát triển...)</div>;
// =========================================================================


// ---- ICONS CHO SIDEBAR ----
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
        {/* <Route path="/" element={<Navigate to="/auth" replace />} /> */}
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

      {/* 4. INSTRUCTOR DASHBOARD */}
      <Route element={
        <ProtectedRoute roles={['instructor', 'admin']} requireApproved={true}>
          <DashboardLayout title="Giảng Viên" sidebarLinks={[
            { path: '/instructor/dashboard', label: 'Quản lý khoá học', icon: <I.Instructor /> },
            { path: '/instructor/create-course', label: 'Tạo khoá học mới', icon: <I.Plus /> },
          ]} />
        </ProtectedRoute>
      }>
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/create-course" element={<CreateCourse />} />
        <Route path="/instructor/edit-course/:id" element={<EditCourse />} />
      </Route>

      {/* 5. [THÀNH VIÊN 4] - TRANG THÔNG BÁO CHỜ DUYỆT */}
      <Route path="/instructor/pending" element={
        <ProtectedRoute roles={['instructor']}>
          <PendingApproval />
        </ProtectedRoute>
      } />

      {/* 6. ADMIN DASHBOARD */}
      <Route element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout title="Quản Trị Hệ Thống" sidebarLinks={[
            { path: '/admin/dashboard', label: 'Tổng quan', icon: <I.Admin /> },
            { path: '/admin/users', label: 'Người dùng', icon: <I.Users /> },
            { path: '/admin/instructors', label: 'Phê duyệt GV', icon: <I.Instructor /> }, // Chức năng TV4
            { path: '/admin/categories', label: 'Danh mục', icon: <I.Categories /> },       // Chức năng TV4
          ]} />
        </ProtectedRoute>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/instructors" element={<ManageInstructors />} /> {/* TV4 */}
        <Route path="/admin/categories" element={<ManageCategories />} />   {/* TV4 */}
      </Route>

      {/* 7. FALLBACKS */}
      <Route path="/unauthorized" element={
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
          <h1 className="text-3xl font-bold mb-4">403 TỪ CHỐI</h1>
          <p className="text-slate-400">Bạn không có quyền truy cập trang này.</p>
        </div>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}