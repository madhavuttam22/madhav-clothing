/**
 * ProtectedRoute.js
 * 
 * A higher-order component that protects routes from unauthorized access.
 * Redirects to login page if user is not authenticated.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../component/context/AuthContext.jsx";

/**
 * ProtectedRoute component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render if authenticated
 * @returns {ReactNode} Either the protected children or redirect to login
 */
const ProtectedRoute = ({ children }) => {
  // Get authentication state from context
  const { user, loading } = useAuth();

  // Show loading state while authentication status is being checked
  if (loading) return <p>Loading...</p>;

  /**
   * Render logic:
   * - If user is authenticated (user exists), render the children
   * - If not authenticated, redirect to login page
   */
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;