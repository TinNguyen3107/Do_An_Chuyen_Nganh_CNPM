import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";  // ĐÃ XÓA BrowserRouter
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Import pages
import HomePage from "./pages/Public/HomePage";
import AuthPage from "./pages/Auth/AuthPage";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import CreateCourse from "./pages/Instructor/CreateCourse";
import EditCourse from "./pages/Instructor/EditCourse";

// PrivateRoute component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      color: 'white',
      background: '#0f172a'
    }}>
      Đang tải...
    </div>
  );
  
  if (!user) return <Navigate to="/auth" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      {/* ĐÃ XÓA BrowserRouter Ở ĐÂY */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Instructor Routes */}
        <Route 
          path="/instructor/dashboard" 
          element={
            <PrivateRoute allowedRoles={['instructor', 'admin']}>
              <InstructorDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/instructor/create-course" 
          element={
            <PrivateRoute allowedRoles={['instructor', 'admin']}>
              <CreateCourse />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/instructor/edit-course/:id" 
          element={
            <PrivateRoute allowedRoles={['instructor', 'admin']}>
              <EditCourse />
            </PrivateRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;