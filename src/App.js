import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import CoursList from './components/CoursList';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

// Composant de chargement
const LoadingSpinner = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <div className="spinner"></div>
    <p>Chargement...</p>
  </div>
);

function App() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [refreshCours, setRefreshCours] = useState(false);

  // Chargement du profil
  const loadProfile = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/auth/profil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      localStorage.setItem('userRole', res.data.user.role);
      console.log('✅ Utilisateur chargé:', res.data.user);
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // Effet au montage et changement de token
  useEffect(() => {
    axios.get(`${API_URL}/health`)
      .then(response => setMessage(response.data.status))
      .catch(error => setMessage('Erreur de connexion au backend'));
    
    if (token) {
      loadProfile();
    }
  }, [token]);

  // Soumission du formulaire (connexion/inscription)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isLogin) {
        response = await axios.post(`${API_URL}/api/auth/connexion`, { email, password });
      } else {
        response = await axios.post(`${API_URL}/api/auth/inscription`, { 
          nom, 
          prenom: prenom || '', 
          email, 
          password 
        });
      }
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      alert(isLogin ? '✅ Connexion réussie !' : '✅ Inscription réussie !');
    } catch (error) {
      alert('❌ Erreur : ' + (error.response?.data?.message || error.message));
    }
  };

  // Déconnexion
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  };

  // Rafraîchir la liste des cours
  const handleCoursCreated = () => {
    setRefreshCours(!refreshCours);
  };

  // Écran de connexion / inscription
  if (!token) {
    return (
      <Router>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>📚 Application Concours</h1>
          <p>Statut backend : <strong style={{ color: message === 'healthy' ? 'green' : 'red' }}>{message || 'Chargement...'}</strong></p>
          
          <div className="container">
            <div className="card">
              <h2>{isLogin ? '🔐 Connexion' : '📝 Inscription'}</h2>
              <button onClick={() => setIsLogin(!isLogin)} className="btn" style={{ marginBottom: '20px' }}>
                {isLogin ? 'Créer un compte' : 'Déjà inscrit ? Se connecter'}
              </button>
              
              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    <div className="form-group">
                      <label>Nom *</label>
                      <input type="text" className="input" value={nom} onChange={(e) => setNom(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Prénom</label>
                      <input type="text" className="input" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              
                <button type="submit" className="btn">
                  {isLogin ? 'Se connecter' : "S'inscrire"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Router>
    );
  }

  // Application connectée avec routes
  return (
    <Router>
      <div>
        {/* Barre de navigation */}
        <div className="navbar">
          <h1>📚 Application Concours</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Accueil</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ color: '#fff', textDecoration: 'none' }}>Admin</Link>
            )}
            <span>👋 {user?.nom} {user?.prenom} ({user?.role})</span>
            <button onClick={handleLogout} className="btn btn-danger" style={{ width: 'auto', padding: '8px 16px' }}>
              Déconnexion
            </button>
          </div>
        </div>
        
        {/* Routes */}
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Route Accueil - Liste des cours uniquement */}
            <Route path="/" element={
              <div className="container">
                <CoursList key={refreshCours} refreshTrigger={refreshCours} />
              </div>
            } />
            
            {/* Route Admin - Dashboard complet avec création de cours */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true} user={user} token={token}>
                <AdminDashboard token={token} />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;