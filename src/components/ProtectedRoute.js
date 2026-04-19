import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false, user, token }) => {
  // Vérifier si l'utilisateur est connecté
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Vérifier si la route nécessite un admin
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;