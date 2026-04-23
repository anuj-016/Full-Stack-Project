import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !user.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/products" replace />;
  }

  return children;
}
