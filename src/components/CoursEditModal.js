import React, { useState, useEffect } from 'react';
import coursService from '../services/coursService';

function CoursEditModal({ cours, token, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree: '',
    niveau: 'débutant',
    prix: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cours) {
      setFormData({
        titre: cours.titre || '',
        description: cours.description || '',
        duree: cours.duree || '',
        niveau: cours.niveau || 'débutant',
        prix: cours.prix || 0
      });
    }
  }, [cours]);

  const niveaux = ['débutant', 'intermédiaire', 'avancé'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const coursData = {
        ...formData,
        duree: parseInt(formData.duree),
        prix: parseInt(formData.prix) || 0
      };
      
      await coursService.update(cours._id, coursData, token);
      onUpdate();
      onClose();
    } catch (err) {
      setError('❌ Erreur : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!cours) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '10px',
        width: '500px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflow: 'auto'
      }}>
        <h2>✏️ Modifier le cours</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Titre *</label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>Durée (heures) *</label>
              <input
                type="number"
                name="duree"
                value={formData.duree}
                onChange={handleChange}
                required
                min="1"
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            
            <div>
              <label>Niveau</label>
              <select
                name="niveau"
                value={formData.niveau}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            
            <div>
              <label>Prix (€)</label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                min="0"
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}
            >
              {loading ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CoursEditModal;