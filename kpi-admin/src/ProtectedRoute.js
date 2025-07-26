import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(120deg, #e3f2fd 0%, #fce4ec 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#1976d2',
          fontSize: '18px',
          fontWeight: 600
        }}>
          Memuatkan...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute; 