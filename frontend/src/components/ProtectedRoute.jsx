import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = null, 
  requiredPermission = null,
  fallbackPath = '/login' 
}) => {
  const { user, hasRole, hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#0D4715'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  const unauthorizedScreen = (message, detail) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      padding: '2rem',
      textAlign: 'center',
      background: '#f7f7f7'
    }}>
      <div style={{
        backgroundColor: '#fff',
        color: '#0D4715',
        padding: '2rem',
        borderRadius: '16px',
        maxWidth: '540px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#c33', fontSize: '2.5rem' }}>
          404
        </h1>
        <h2 style={{ margin: '0 0 1rem 0', color: '#c33' }}>
          Unauthorized
        </h2>
        <p style={{ margin: '0 0 0.75rem 0' }}>
          {message}
        </p>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#555' }}>
          Unauthorized, please ask for assistance if you need something.
        </p>
        {detail ? (
          <p style={{ margin: '0', fontSize: '0.85rem', color: '#777' }}>{detail}</p>
        ) : null}
        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: '1.25rem',
            backgroundColor: '#0D4715',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (requiredRoles && !hasRole(requiredRoles)) {
    const detail = Array.isArray(requiredRoles)
      ? `Required role: ${requiredRoles.join(' or ')}`
      : `Required role: ${requiredRoles}`;
    return unauthorizedScreen("You don't have permission to access this page.", detail);
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return unauthorizedScreen(
      "You don't have the required permission to access this page.",
      `Required permission: ${requiredPermission}`
    );
  }

  return children;
};

export default ProtectedRoute;
