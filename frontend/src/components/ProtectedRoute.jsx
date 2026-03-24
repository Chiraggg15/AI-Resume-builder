/**
 * ProtectedRoute.jsx
 * ------------------
 * Wrapper that redirects unauthenticated users to /login.
 * Used in App.jsx to protect private routes.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking stored session
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
