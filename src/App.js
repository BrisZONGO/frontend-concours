import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

import CoursList from './components/CoursList';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CoursDetail from "./components/CoursDetail";

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

function App() {

  // ✅ TOUS LES HOOKS EN HAUT
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {

    const loadUser = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/auth/profil`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        setUser(res.data.user);
        localStorage.setItem("userRole", res.data.user.role);

      } catch (err) {
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();

  }, []);

  // =========================
  // LOGIN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = isLogin
        ? await axios.post(`${API_URL}/api/auth/connexion`, { email, password })
        : await axios.post(`${API_URL}/api/auth/inscription`, { nom, prenom, email, password });

      localStorage.setItem("token", res.data.token);
      window.location.reload();

    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
  };

  if (loading) return <p>Chargement...</p>;

  // =========================
  // LOGIN PAGE
  // =========================
  if (!token) {
    return (
      <Router>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>📚 Application Concours</h1>

          <div className="container">
            <div className="card">

              <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>

              <button onClick={() => setIsLogin(!isLogin)} className="btn">
                {isLogin ? 'Créer un compte' : 'Se connecter'}
              </button>

              <form onSubmit={handleSubmit}>

                {!isLogin && (
                  <>
                    <input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
                    <input placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                  </>
                )}

                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <button className="btn">
                  {isLogin ? 'Se connecter' : "S'inscrire"}
                </button>

              </form>
            </div>
          </div>
        </div>
      </Router>
    );
  }

  const role = user?.role || localStorage.getItem("userRole");

  // =========================
  // APP
  // =========================
  return (
    <Router>
      <div>

        <div className="navbar">
          <h1>📚 Concours</h1>

          <div style={{ display: 'flex', gap: '15px' }}>

            <Link to="/">Accueil</Link>

            {role === "admin" && (
              <Link to="/admin">Admin</Link>
            )}

            <span>👋 {user?.nom} ({role})</span>

            <button onClick={handleLogout}>Déconnexion</button>
          </div>
        </div>

        <Routes>

          <Route path="/" element={<CoursList user={user} />} />

          <Route path="/cours/:id" element={<CoursDetail />} />

          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true} user={user}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

        </Routes>

      </div>
    </Router>
  );
}

export default App;