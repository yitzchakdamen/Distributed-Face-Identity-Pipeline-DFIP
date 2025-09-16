import React from "react";
import { useAuth } from "../context/AuthContext";
import "./ProtectedRoute.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Authentication Required</h2>
        <p>Please log in to access this page.</p>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
