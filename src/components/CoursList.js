import React, { useState, useEffect } from 'react';
import coursService from '../services/coursService';
import CoursEditModal from './CoursEditModal';

function CoursList({ refreshTrigger }) {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCours, setSelectedCours] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user');
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    loadCours();
  }, [refreshTrigger]);

  const loadCours = async () => {
    setLoading(true);
    try {
      const data = await coursService.getAll();
      setCours(data.cours || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCours();
      return;
    }
    try {
      const data = await coursService.search(searchTerm);
      setCours(data.cours || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (coursItem) => {
    setSelectedCours(coursItem);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await coursService.delete(id, token);
        loadCours();
        alert('✅ Cours supprimé avec succès !');
      } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la suppression');
      }
    }
  };

  const handleUpdate = () => {
    loadCours();
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Chargement des cours...</div>;

  return (
    <div className="container">
      <h2>📚 Liste des cours</h2>
      
      {/* Barre de recherche */}
      <div className="card">
        <input
          type="text"
          className="input"
          placeholder="Rechercher un cours par titre ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button className="btn" onClick={handleSearch}>
            🔍 Rechercher
          </button>
          <button className="btn" onClick={loadCours} style={{ backgroundColor: '#6c757d' }}>
            🔄 Tous les cours
          </button>
        </div>
      </div>

      {/* Grille des cours */}
      {cours.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '50px', color: '#666' }}>📭 Aucun cours disponible pour le moment.</p>
      ) : (
        <div className="cours-grid">
          {cours.map(c => (
            <div key={c._id} className="card">
              {/* Image du cours avec lazy loading */}
              {c.imageUrl && (
                <img 
                  src={c.imageUrl} 
                  alt={c.titre}
                  loading="lazy"  // ← Chargement différé pour améliorer les performances
                  className="cours-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                  }}
                />
              )}
              
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{c.titre}</h3>
              <p style={{ color: '#666', marginBottom: '10px' }}>{c.description?.substring(0, 100)}...</p>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', fontSize: '14px' }}>
                <span>⏱️ {c.duree}h</span>
                <span>💰 {c.prix}€</span>
                <span>📊 {c.niveau}</span>
              </div>
              
              {/* Boutons Modifier/Supprimer (visibles uniquement pour les admins) */}
              {userRole === 'admin' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  <button 
                    className="btn btn-warning"
                    onClick={() => handleEdit(c)}
                    style={{ flex: 1 }}
                  >
                    ✏️ Modifier
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(c._id)}
                    style={{ flex: 1 }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de modification */}
      {showModal && (
        <CoursEditModal
          cours={selectedCours}
          token={token}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

export default CoursList;