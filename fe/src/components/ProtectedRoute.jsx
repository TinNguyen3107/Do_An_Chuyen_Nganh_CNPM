import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards routes based on authentication and role
 *
 * Usage:
 *   <ProtectedRoute>                          → any logged-in user
 *   <ProtectedRoute roles={['admin']}>        → admin only
 *   <ProtectedRoute roles={['instructor']} requireApproved> → approved instructor
 */
export default function ProtectedRoute({ children, roles, requireApproved = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect to /auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Role restriction
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Require approved instructor
  if (requireApproved && user.role === 'instructor' && user.instructorStatus !== 'approved') {
    return <Navigate to="/instructor/pending" replace />;
  }

  return children;
}
