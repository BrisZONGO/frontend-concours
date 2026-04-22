// frontend/src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const AdminDashboard = ({ token, user }) => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('utilisateurs');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Afficher un message temporaire
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Charger les utilisateurs
  const fetchUtilisateurs = async () => {
    try {
      // Essayer différentes routes possibles
      let response;
      try {
        response = await axios.get(`${API_URL}/api/auth/utilisateurs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        // Si la route n'existe pas, utiliser une alternative
        console.log("Route /api/auth/utilisateurs non trouvée, utilisation de /api/auth/users");
        response = await axios.get(`${API_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setUtilisateurs(response.data.users || response.data || []);
    } catch (err) {
      console.error("❌ Erreur chargement utilisateurs:", err);
      setError("Impossible de charger les utilisateurs");
    }
  };

  // Charger les cours
  const fetchCours = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cours`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCours(response.data);
    } catch (err) {
      console.error("❌ Erreur chargement cours:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUtilisateurs(), fetchCours()]);
      setLoading(false);
    };
    loadData();
  }, [token]);

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      // Essayer différentes routes possibles
      try {
        await axios.delete(`${API_URL}/api/auth/utilisateurs/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        if (err.response?.status === 404) {
          // Essayer avec une autre route
          await axios.delete(`${API_URL}/api/auth/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          throw err;
        }
      }
      
      showMessage('✅ Utilisateur supprimé avec succès', 'success');
      fetchUtilisateurs(); // Recharger la liste
    } catch (err) {
      console.error("❌ Erreur suppression:", err);
      showMessage(`❌ Erreur: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // Supprimer un cours
  const handleDeleteCours = async (coursId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      await axios.delete(`${API_URL}/api/cours/${coursId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showMessage('✅ Cours supprimé avec succès', 'success');
      fetchCours(); // Recharger la liste
    } catch (err) {
      console.error("❌ Erreur suppression cours:", err);
      showMessage(`❌ Erreur: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // Styles
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    title: {
      fontSize: '24px',
      color: '#333'
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      borderBottom: '1px solid #ddd'
    },
    tab: (isActive) => ({
      padding: '10px 20px',
      cursor: 'pointer',
      borderBottom: isActive ? '2px solid #007bff' : 'none',
      color: isActive ? '#007bff' : '#666',
      fontWeight: isActive ? 'bold' : 'normal'
    }),
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      padding: '12px',
      textAlign: 'left',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #ddd'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #eee'
    },
    deleteBtn: {
      padding: '5px 10px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    message: (type) => ({
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      backgroundColor: type === 'success' ? '#28a745' : '#dc3545',
      color: 'white',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease'
    }),
    loading: {
      textAlign: 'center',
      padding: '50px',
      fontSize: '18px',
      color: '#666'
    },
    statCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#007bff'
    },
    statLabel: {
      color: '#666',
      marginTop: '5px'
    }
  };

  if (loading) {
    return <div style={styles.loading}>⏳ Chargement du tableau de bord...</div>;
  }

  return (
    <div style={styles.container}>
      {message.text && (
        <div style={styles.message(message.type)}>
          {message.text}
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>📊 Tableau de bord Administrateur</h1>
        <p>👋 Bienvenue, {user?.prenom || user?.nom || 'Admin'} !</p>
      </div>

      {/* Statistiques */}
      <div style={styles.statCards}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{utilisateurs.length}</div>
          <div style={styles.statLabel}>Utilisateurs</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{cours.length}</div>
          <div style={styles.statLabel}>Cours</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>0</div>
          <div style={styles.statLabel}>Ventes totales</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>0 FCFA</div>
          <div style={styles.statLabel}>Chiffre d'affaires</div>
        </div>
      </div>

      {/* Onglets */}
      <div style={styles.tabs}>
        <div 
          style={styles.tab(activeTab === 'utilisateurs')}
          onClick={() => setActiveTab('utilisateurs')}
        >
          👥 Utilisateurs ({utilisateurs.length})
        </div>
        <div 
          style={styles.tab(activeTab === 'cours')}
          onClick={() => setActiveTab('cours')}
        >
          📚 Cours ({cours.length})
        </div>
      </div>

      {/* Contenu des onglets */}
      <div style={styles.card}>
        {activeTab === 'utilisateurs' && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Date d'inscription</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                utilisateurs.map((u) => (
                  <tr key={u._id || u.id}>
                    <td style={styles.td}>{u.prenom} {u.nom}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        backgroundColor: u.role === 'admin' ? '#ffc107' : '#28a745',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={styles.td}>
                      <button 
                        style={styles.deleteBtn}
                        onClick={() => handleDeleteUser(u._id || u.id)}
                        disabled={u.email === user?.email}
                        title={u.email === user?.email ? "Vous ne pouvez pas vous supprimer vous-même" : ""}
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'cours' && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Titre</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Prix</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cours.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                    Aucun cours trouvé
                  </td>
                </tr>
              ) : (
                cours.map((c) => (
                  <tr key={c._id || c.id}>
                    <td style={styles.td}>{c.titre || c.title || c.nom}</td>
                    <td style={styles.td}>
                      {c.description?.substring(0, 50)}...
                    </td>
                    <td style={styles.td}>
                      <strong>{c.prix || 0} FCFA</strong>
                    </td>
                    <td style={styles.td}>
                      <button 
                        style={styles.deleteBtn}
                        onClick={() => handleDeleteCours(c._id || c.id)}
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;