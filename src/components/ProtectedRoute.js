import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  user, 
  token,
  redirectTo = "/",
  showAccessDenied = false
}) => {
  if (!token) {
    console.log("🔒 Accès refusé: Pas de token");
    return <Navigate to={redirectTo} replace />;
  }

  if (adminOnly) {
    const userRole = localStorage.getItem('userRole') || user?.role;
    
    console.log("🔍 Vérification accès admin:", {
      adminOnly: true,
      userRole: userRole,
      tokenPresent: !!token
    });

    if (userRole !== 'admin') {
      console.log("🔒 Accès refusé: Rôle non admin");
      if (showAccessDenied) {
        return (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <h2>⛔ Accès refusé</h2>
            <p>Vous devez être administrateur pour accéder à cette page.</p>
          </div>
        );
      }
      return <Navigate to={redirectTo} replace />;
    }
    
    console.log("✅ Accès admin autorisé");
  }

  return children;
};

export default ProtectedRoute;
