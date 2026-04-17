import React, { useState } from 'react';
import coursService from '../services/coursService';

function CoursForm({ token, onCoursCreated }) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree: '',
    niveau: 'débutant',
    prix: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const niveaux = ['débutant', 'intermédiaire', 'avancé'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const coursData = {
        ...formData,
        duree: parseInt(formData.duree),
        prix: parseInt(formData.prix) || 0
      };
      
      await coursService.create(coursData, token);
      setSuccess('✅ Cours créé avec succès !');
      setFormData({ titre: '', description: '', duree: '', niveau: 'débutant', prix: '' });
      if (onCoursCreated) onCoursCreated();
    } catch (err) {
      setError('❌ Erreur : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
      <h3>➕ Ajouter un nouveau cours</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Titre *</label>
          <input type="text" name="titre" value={formData.titre} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Description *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label>Durée (heures) *</label>
            <input type="number" name="duree" value={formData.duree} onChange={handleChange} required min="1" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div>
            <label>Niveau</label>
            <select name="niveau" value={formData.niveau} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
              {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label>Prix (€)</label>
            <input type="number" name="prix" value={formData.prix} onChange={handleChange} min="0" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
        </div>
        
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px' }}>
          {loading ? 'Création...' : '➕ Créer le cours'}
        </button>
      </form>
    </div>
  );
}

export default CoursForm;