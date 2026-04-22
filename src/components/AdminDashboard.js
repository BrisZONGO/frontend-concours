import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import CoursForm from './CoursForm';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

function AdminDashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ nom: '', email: '', password: '', role: 'user' });
  const [message, setMessage] = useState('');
  const [refreshCours, setRefreshCours] = useState(false);

  // ✅ Mémoriser les headers d'authentification
  const authHeaders = useMemo(() => ({ 
    headers: { Authorization: `Bearer ${token}` } 
  }), [token]);

  // Liste des utilisateurs
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/utilisateurs`, authHeaders);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Erreur utilisateurs:', error);
    }
  }, [authHeaders]);

  // Liste des cours
  const fetchCours = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cours`);
      setCours(res.data.cours || []);
    } catch (error) {
      console.error('Erreur cours:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/auth/inscription`, newUser);
      setMessage('✅ Utilisateur créé avec succès !');
      fetchUsers();
      setNewUser({ nom: '', email: '', password: '', role: 'user' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur : ' + (error.response?.data?.message || error.message));
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`${API_URL}/api/auth/utilisateurs/${userId}`, authHeaders);
        fetchUsers();
        setMessage('✅ Utilisateur supprimé !');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Erreur suppression');
      }
    }
  };

  // Changer le rôle d'un utilisateur
  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(`${API_URL}/api/auth/utilisateurs/${userId}/role`, 
        { role: newRole },
        authHeaders
      );
      fetchUsers();
      setMessage(`✅ Rôle changé en ${newRole}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur changement de rôle');
    }
  };

  // Rafraîchir la liste des cours après création
  const handleCoursCreated = () => {
    setRefreshCours(!refreshCours);
    fetchCours();
  };

  useEffect(() => {
    fetchUsers();
    fetchCours();
  }, [fetchUsers, fetchCours]);

  if (loading) return <div className="container"><div className="card">Chargement du dashboard...</div></div>;

  return (
    <div className="container">
      <h2>👑 Dashboard Administrateur</h2>
      
      {message && (
        <div className="card" style={{ backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da', color: message.includes('✅') ? '#155724' : '#721c24' }}>
          {message}
        </div>
      )}
      
      {/* Formulaire d'ajout de cours */}
      <div className="card">
        <h3>📚 Créer un nouveau cours</h3>
        <CoursForm token={token} onCoursCreated={handleCoursCreated} />
      </div>
      
      {/* Statistiques */}
      <div className="card">
        <h3>📊 Statistiques générales</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', textAlign: 'center' }}>
          <div>
            <h2 style={{ color: '#007bff' }}>{users.length}</h2>
            <p>Utilisateurs</p>
          </div>
          <div>
            <h2 style={{ color: '#28a745' }}>{cours.length}</h2>
            <p>Cours</p>
          </div>
          <div>
            <h2 style={{ color: '#ffc107' }}>{users.filter(u => u.role === 'admin').length}</h2>
            <p>Administrateurs</p>
          </div>
        </div>
      </div>
      
      {/* Formulaire d'ajout d'utilisateur */}
      <div className="card">
        <h3>➕ Ajouter un utilisateur</h3>
        <form onSubmit={handleCreateUser}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <input
              type="text"
              className="input"
              placeholder="Nom"
              value={newUser.nom}
              onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
              required
            />
            <input
              type="email"
              className="input"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="input"
              placeholder="Mot de passe"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <select
              className="input"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <button type="submit" className="btn" style={{ marginTop: '10px' }}>➕ Créer l'utilisateur</button>
        </form>
      </div>
      
      {/* Liste des utilisateurs */}
      <div className="card">
        <h3>👥 Gestion des utilisateurs</h3>
        <div className="cours-grid">
          {users.map(user => (
            <div key={user._id} className="card" style={{ position: 'relative' }}>
              <p><strong>{user.nom} {user.prenom}</strong></p>
              <p>📧 {user.email}</p>
              <p>👑 Rôle: <strong style={{ color: user.role === 'admin' ? '#28a745' : '#007bff' }}>{user.role}</strong></p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <select
                  className="input"
                  value={user.role}
                  onChange={(e) => handleChangeRole(user._id, e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteUser(user._id)}
                  style={{ width: 'auto' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Liste des cours */}
      <div className="card">
        <h3>📚 Liste des cours</h3>
        <div className="cours-grid">
          {cours.map(c => (
            <div key={c._id} className="card">
              <h4>{c.titre}</h4>
              <p>{c.description?.substring(0, 80)}...</p>
              <p>⏱️ {c.duree}h | 💰 {c.prix}€ | 📊 {c.niveau}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;