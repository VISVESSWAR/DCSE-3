// src/ui/ProtectedRoutes.jsx
import { Navigate, Outlet } from "react-router-dom";
import { UserData } from "../context/UserContext";

export default function ProtectedRoutes({ roles = [] }) {
  const { user } = UserData();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length === 0 || roles.includes("all")) {
    return <Outlet />;
  }

  // Check if user has required role
  if (roles.includes(user.role)) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />; 
}
