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
    <div className="card">
      <h3>➕ Ajouter un nouveau cours</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Titre *</label>
          <input
            type="text"
            className="input"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description *</label>
          <textarea
            className="input"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Durée (heures) *</label>
            <input
              type="number"
              className="input"
              name="duree"
              value={formData.duree}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          
          <div className="form-group">
            <label>Niveau</label>
            <select
              className="input"
              name="niveau"
              value={formData.niveau}
              onChange={handleChange}
            >
              {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label>Prix (€)</label>
            <input
              type="number"
              className="input"
              name="prix"
              value={formData.prix}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn"
          disabled={loading}
        >
          {loading ? 'Création...' : '➕ Créer le cours'}
        </button>
      </form>
    </div>
  );
}

export default CoursForm;