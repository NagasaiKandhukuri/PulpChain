import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { supabase } from '../lib/supabase';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Hardening: Enforce email confirmation
    if (user && !user.email_confirmed_at) {
      supabase.auth.signOut().then(() => {
        let redirectPath = '/login';
        if (allowedRole === 'admin') redirectPath = '/admin/login';
        if (allowedRole === 'industry') redirectPath = '/industry/login';

        navigate(redirectPath, {
          replace: true,
          state: { error: 'Your email is not verified. Please verify your email before accessing protected pages.' }
        });
      });
    }
  }, [user, allowedRole, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Authenticating securely...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user && !user.email_confirmed_at) {
    return null; // Let the useEffect handle the redirect
  }

  if (!user) {
    if (allowedRole === 'admin') return <Navigate to="/admin/login" replace />;
    if (allowedRole === 'industry') return <Navigate to="/industry/login" replace />;
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'industry') return <Navigate to="/industry/dashboard" replace />;
    return <Navigate to="/school/dashboard" replace />;
  }

  return children;
};
