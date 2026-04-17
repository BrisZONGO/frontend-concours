import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CoursList from './components/CoursList';
import CoursForm from './components/CoursForm';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

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
    axios.get(`${API_URL}/health`)
      .then(response => setMessage(response.data.status))
      .catch(error => setMessage('Erreur de connexion au backend'));
    
    // Charger le profil si token existe
    if (token) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ========== Récupération automatique du profil ==========
  const loadProfile = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/auth/profil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      localStorage.setItem('userRole', response.data.user.role);
      console.log('✅ Profil chargé :', response.data.user);
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        console.log('Token invalide, déconnexion...');
        handleLogout();
      }
    }
  };

  // ========== Récupération du profil avec API (version améliorée) ==========
  // Cette fonction utilise l'API centralisée (à décommenter si vous avez le fichier api.js)
  /*
  const loadProfileWithApi = async () => {
    if (!token) return;
    
    try {
      const res = await API.get("/auth/profil");
      setUser(res.data.user);
      localStorage.setItem('userRole', res.data.user.role);
      console.log("✅ Utilisateur :", res.data.user);
    } catch (err) {
      console.log("❌ Non connecté ou erreur:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isLogin) {
        response = await axios.post(`${API_URL}/auth/connexion`, { email, password });
      } else {
        response = await axios.post(`${API_URL}/auth/inscription`, { nom, prenom, email, password });
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
        
        <div style={{ display: 'inline-block', textAlign: 'left', marginTop: '30px', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#f9f9f9', width: '100%', maxWidth: '400px' }}>
          <h2>{isLogin ? '🔐 Connexion' : '📝 Inscription'}</h2>
          <button onClick={() => setIsLogin(!isLogin)} style={{ marginBottom: '20px', cursor: 'pointer', width: '100%', padding: '10px' }}>
            {isLogin ? 'Créer un compte' : 'Déjà inscrit ? Se connecter'}
          </button>
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <label>Nom: </label>
                  <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>Prénom: </label>
                  <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
              </>
            )}
            <div style={{ marginBottom: '10px' }}>
              <label>Email: </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label>Mot de passe: </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
              {isLogin ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Application connectée
  return (
    <div>
      {/* Barre de navigation */}
      <div style={{ background: '#2c3e50', color: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📚 Application Concours</h1>
        <div>
          <span style={{ marginRight: '15px' }}>👋 {user?.nom} {user?.prenom} ({user?.role})</span>
          <button onClick={handleLogout} style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '5px' }}>
            Déconnexion
          </button>
        </div>
      </div>
      
      {/* Formulaire d'ajout de cours */}
      <div style={{ padding: '20px' }}>
        <CoursForm token={token} onCoursCreated={handleCoursCreated} />
      </div>
      
      {/* Liste des cours avec refreshTrigger pour rafraîchir */}
      <CoursList key={refreshCours} refreshTrigger={refreshCours} />
    </div>
  );
}

export default App;
