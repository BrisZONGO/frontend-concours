import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false, user, token }) => {
  if (!token) {
    return <Navigate to="/" replace />;
  }

  const storedRole = localStorage.getItem("userRole");
  const role = user?.role || storedRole;

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
