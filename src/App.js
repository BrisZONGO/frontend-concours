import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import './App.css';

// Chargement paresseux (lazy loading) des composants lourds
const CoursList = lazy(() => import('./components/CoursList'));
const CoursForm = lazy(() => import('./components/CoursForm'));

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

// Composant de chargement (skeleton)
const LoadingSpinner = () => (
  <div style={{ 
    textAlign: 'center', 
    padding: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  }}>
    <div className="spinner"></div>
    <p style={{ marginLeft: '10px' }}>Chargement...</p>
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

  // ========== useEffect pour charger le profil automatiquement ==========
  useEffect(() => {
    // Test de connexion au backend
     axios.get(`${API_URL}/api/health`)
      .then(response => setMessage(response.data.status))
      .catch(error => setMessage('Erreur de connexion au backend'));
    
    // Charger le profil si token existe
    if (token) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ========== loadProfile avec axios (corrigé) ==========
 // APRÈS (CORRIGÉ)
const loadProfile = async () => {
  if (!token) return;
  try {
   const res = await axios.get(`${API_URL}/api/auth/profil`, {
  headers: { Authorization: `Bearer ${token}` }
});
 
    setUser(res.data.user);
    localStorage.setItem('userRole', res.data.user.role);
  } catch (err) {
    console.log("❌ Erreur chargement profil:", err);
    if (err.response?.status === 401) {
      handleLogout();
    }
  }
}; 
  // ========== handleSubmit avec axios (corrigé) ==========
// APRÈS (CORRIGÉ)
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    let response;
    if (isLogin) {
      response = await axios.post(`${API_URL}/api/auth/connexion`, { email, password });
    } else {
      response = await axios.post(`${API_URL}/api/auth/inscription`, { nom, prenom: prenom || '', email, password });
    }
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    alert(isLogin ? '✅ Connexion réussie !' : '✅ Inscription réussie !');
  } catch (error) {
    alert('❌ Erreur : ' + (error.response?.data?.message || error.message));
  }
};

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    console.log('👋 Déconnecté');
  };

  const handleCoursCreated = () => {
    setRefreshCours(!refreshCours);
  };

  // Écran de connexion / inscription
  if (!token) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>📚 Application Concours</h1>
        <p>Statut backend : <strong style={{ color: message === 'healthy' ? 'green' : 'red' }}>{message || 'Chargement...'}</strong></p>
        
        <div className="container">
          <div className="card">
            <h2>{isLogin ? '🔐 Connexion' : '📝 Inscription'}</h2>
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="btn"
              style={{ marginBottom: '20px' }}
            >
              {isLogin ? 'Créer un compte' : 'Déjà inscrit ? Se connecter'}
            </button>
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label>Nom: </label>
                    <input 
                      type="text" 
                      className="input"
                      value={nom} 
                      onChange={(e) => setNom(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom: </label>
                    <input 
                      type="text" 
                      className="input"
                      value={prenom} 
                      onChange={(e) => setPrenom(e.target.value)} 
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label>Email: </label>
                <input 
                  type="email" 
                  className="input"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Mot de passe: </label>
                <input 
                  type="password" 
                  className="input"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            
              <button 
                type="submit" 
                className="btn"
              >
                {isLogin ? 'Se connecter' : "S'inscrire"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Application connectée avec chargement paresseux
  return (
    <div>
      {/* Barre de navigation */}
      <div className="navbar">
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📚 Application Concours</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>👋 {user?.nom} {user?.prenom} ({user?.role})</span>
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: 'auto', padding: '8px 16px' }}>
            Déconnexion
          </button>
        </div>
      </div>
      
      {/* Contenu avec lazy loading et Suspense */}
      <Suspense fallback={<LoadingSpinner />}>
        <div className="container">
          <CoursForm token={token} onCoursCreated={handleCoursCreated} />
        </div>
        <CoursList key={refreshCours} refreshTrigger={refreshCours} />
      </Suspense>
    </div>
  );
}

export default App;