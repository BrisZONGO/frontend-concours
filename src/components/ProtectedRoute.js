import React from "react";
import { Navigate } from "react-router-dom";

// =============================
// 🔐 PROTECTED ROUTE
// =============================
const ProtectedRoute = ({ children, adminOnly = false, user, token }) => {

  console.log("🔍 Vérification accès:", {
    adminOnly,
    user,
    token: !!token
  });

  // =============================
  // ❌ PAS CONNECTÉ
  // =============================
  if (!token) {
    console.log("⛔ Pas de token → redirection accueil");
    return <Navigate to="/" replace />;
  }

  // =============================
  // 🔍 RÉCUPÉRATION RÔLE
  // =============================
  const storedRole = localStorage.getItem("userRole");

  const role = user?.role || storedRole;

  console.log("🎭 Rôle détecté:", role);

  // =============================
  // ❌ PAS ADMIN
  // =============================
  if (adminOnly && role !== "admin") {
    console.log("⛔ Accès refusé (non admin)");
    return <Navigate to="/" replace />;
  }

  // =============================
  // ✅ ACCÈS AUTORISÉ
  // =============================
  console.log("✅ Accès autorisé");

  return children;
};

export default ProtectedRoute;