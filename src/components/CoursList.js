import React, { useState, useEffect } from 'react';
import coursService from '../services/coursService';
import CoursEditModal from './CoursEditModal';

function CoursList({ refreshTrigger, user }) {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCours, setSelectedCours] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Lecture directe depuis localStorage (pas de state, pas de timing bug)
  const token = localStorage.getItem('token');
  const userRole = user?.role || localStorage.getItem('userRole') || 'guest';

  // ======================
  // 📚 LOAD COURS
  // ======================
  useEffect(() => {
    loadCours();
  }, [refreshTrigger]);

  const loadCours = async () => {
    setLoading(true);
    try {
      const data = await coursService.getAll();
      setCours(data.cours || []);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // 🔍 SEARCH
  // ======================
  const handleSearch = async () => {
    if (!searchTerm.trim()) return loadCours();

    try {
      const data = await coursService.search(searchTerm);
      setCours(data.cours || []);
    } catch (error) {
      console.error('Erreur recherche:', error);
    }
  };

  // ======================
  // ✏️ EDIT
  // ======================
  const handleEdit = (coursItem) => {
    setSelectedCours(coursItem);
    setShowModal(true);
  };

  // ======================
  // 🗑️ DELETE
  // ======================
  const handleDelete = async (id) => {
    if (!token) return alert("⛔ Non autorisé");

    if (window.confirm('Supprimer ce cours ?')) {
      try {
        await coursService.delete(id, token);
        loadCours();
        alert('✅ Cours supprimé');
      } catch (error) {
        console.error(error);
        alert('❌ Erreur suppression');
      }
    }
  };

  const handleUpdate = () => loadCours();

  // ======================
  // ⏳ LOADING
  // ======================
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Chargement...</div>;
  }

  return (
    <div className="container">
      <h2>📚 Liste des cours</h2>

      {/* 👤 ROLE */}
      <p>
        👤 Rôle :
        <strong style={{ marginLeft: 5, color: userRole === 'admin' ? 'green' : 'blue' }}>
          {userRole}
        </strong>
      </p>

      {/* 🔍 SEARCH */}
      <div className="card">
        <input
          type="text"
          className="input"
          placeholder="Rechercher un cours..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn" onClick={handleSearch}>🔍 Rechercher</button>
          <button className="btn" onClick={loadCours} style={{ backgroundColor: '#6c757d' }}>
            🔄 Reset
          </button>
        </div>
      </div>

      {/* 📦 LISTE */}
      {cours.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '50px' }}>📭 Aucun cours</p>
      ) : (
        <div className="cours-grid">
          {cours.map(c => (
            <div key={c._id} className="card">

              {c.imageUrl && (
                <img
                  src={c.imageUrl}
                  alt={c.titre}
                  loading="lazy"
                  className="cours-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image';
                  }}
                />
              )}

              <h3>{c.titre}</h3>
              <p>{c.description?.substring(0, 100)}...</p>

              <div style={{ display: 'flex', gap: 15 }}>
                <span>⏱️ {c.duree}h</span>
                <span>💰 {c.prix}€</span>
                <span>📊 {c.niveau}</span>
              </div>

              {/* 👑 ADMIN */}
              {userRole === 'admin' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                  <button className="btn btn-warning" onClick={() => handleEdit(c)}>
                    ✏️ Modifier
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(c._id)}>
                    🗑️ Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
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