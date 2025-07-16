import { Navigate } from "react-router-dom";
import { useAuth } from "../component/context/AuthContext.jsx";

/**
 * ProtectedRoute component that restricts access based on auth status
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Firebase is still checking auth state — don't redirect yet
    return <div style={{ padding: "20px", textAlign: "center" }}>Checking login status...</div>;
  }

  // If user is authenticated, allow access; otherwise, redirect to login
  return user ? children : <Navigate to="/login/" replace />;
};

export default ProtectedRoute;
