import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FEATURES } from '../lib/features';
import { authService } from '../services/auth';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!FEATURES.USE_SUPABASE_AUTH) {
     const legacyUser = authService.getCurrentUser();
     if (!legacyUser) {
       if (allowedRole === 'admin') return <Navigate to="/admin/login" replace />;
       if (allowedRole === 'industry') return <Navigate to="/industry/login" replace />;
       return <Navigate to="/login" replace />;
     }
     if (allowedRole && legacyUser.role !== allowedRole) {
       if (legacyUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
       if (legacyUser.role === 'industry') return <Navigate to="/industry/dashboard" replace />;
       return <Navigate to="/school/dashboard" replace />;
     }
     return children;
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
