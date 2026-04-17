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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>📚 Liste des cours</h2>
      
      {/* Barre de recherche */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Rechercher un cours par titre ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
        />
        <button onClick={handleSearch} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
          🔍 Rechercher
        </button>
        <button onClick={loadCours} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px' }}>
          🔄 Tous les cours
        </button>
      </div>

      {/* Grille des cours */}
      {cours.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '50px', color: '#666' }}>📭 Aucun cours disponible pour le moment.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {cours.map(c => (
            <div key={c._id} style={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: '10px', 
              padding: '15px', 
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}>
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
                    onClick={() => handleEdit(c)}
                    style={{ flex: 1, padding: '8px', cursor: 'pointer', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '5px' }}
                  >
                    ✏️ Modifier
                  </button>
                  <button 
                    onClick={() => handleDelete(c._id)}
                    style={{ flex: 1, padding: '8px', cursor: 'pointer', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px' }}
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