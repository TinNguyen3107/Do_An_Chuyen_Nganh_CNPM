import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load persisted user on mount
  useEffect(() => {
    const saved = localStorage.getItem('26tech_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); }
      catch { localStorage.removeItem('26tech_user'); }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('26tech_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    setUser(null);
    localStorage.removeItem('26tech_user');
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      const freshUser = res.data.data;
      // Preserve token
      const stored = JSON.parse(localStorage.getItem('26tech_user') || '{}');
      const merged = { ...freshUser, token: stored.token };
      setUser(merged);
      localStorage.setItem('26tech_user', JSON.stringify(merged));
      return merged;
    } catch {
      logout();
    }
  }, [logout]);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isInstructor: user?.role === 'instructor',
    isAdmin: user?.role === 'admin',
    isApprovedInstructor: user?.role === 'instructor' && user?.instructorStatus === 'approved',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
