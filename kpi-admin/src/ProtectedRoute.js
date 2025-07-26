import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children, requiredRole = null }) {
  const { user, userRole, userDepartment, loading } = useAuth();

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

  // Check role-based access
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    console.log('Required roles:', allowedRoles);
    console.log('User role:', userRole);
    console.log('User department:', userDepartment);
    
    if (!allowedRoles.includes(userRole)) {
      console.log('Access denied - redirecting to dashboard');
      // Redirect to dashboard if user doesn't have required role
      return <Navigate to="/" replace />;
    }
    console.log('Access granted');
  }

  return children;
}

export default ProtectedRoute; 