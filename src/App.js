import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

import './App.css';
import Login from './components/Login';

// 📦 Lazy loading
const CoursList = lazy(() => import('./components/CoursList'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const CoursDetail = lazy(() => import('./components/CoursDetail'));

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const Loader = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    ⏳ Chargement...
  </div>
);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.reload();
  };

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const decoded = decodeToken(storedToken);
        if (decoded?.role) {
          localStorage.setItem('userRole', decoded.role);
        }

        const res = await axios.get(`${API_URL}/api/auth/profil`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        setUser(res.data.user);

        if (res.data.user?.role) {
          localStorage.setItem('userRole', res.data.user.role);
        }
      } catch (err) {
        console.error('❌ Erreur profil:', err.message);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const role = (() => {
    const stored = localStorage.getItem('userRole');

    if (stored) return stored;
    if (user?.role) return user.role;

    if (token) {
      const decoded = decodeToken(token);
      return decoded?.role || 'user';
    }

    return 'guest';
  })();

  if (loading) return <Loader />;

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div>
        <div className="navbar">
          <h1>📚 Concours</h1>

          <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <Link to="/" style={{ color: '#fff' }}>
              Accueil
            </Link>

            {role === 'admin' && (
              <Link
                to="/admin"
                style={{
                  color: '#fff',
                  background: 'green',
                  padding: '5px 10px',
                  borderRadius: '5px'
                }}
              >
                Admin
              </Link>
            )}

            <span>
              👤 {user?.prenom || user?.nom || 'User'} ({role})
            </span>

            <button onClick={handleLogout} className="btn btn-danger">
              Déconnexion
            </button>
          </div>
        </div>

        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<CoursList user={user} />} />
            <Route path="/cours/:id" element={<CoursDetail />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true} user={user} token={token}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;

