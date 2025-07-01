// src/routes/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../component/context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
