import React, { useState } from 'react';
import coursService from '../services/coursService';

function CoursForm({ token, onCoursCreated }) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree: '',
    niveau: 'débutant',
    prix: '',
    estPremium: false,
    anneeAcademique: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    image: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const niveaux = ['débutant', 'intermédiaire', 'avancé'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const coursData = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        duree: formData.duree.trim(),
        niveau: formData.niveau,
        prix: parseInt(formData.prix, 10) || 0,
        estPremium: formData.estPremium,
        anneeAcademique: formData.anneeAcademique.trim(),
        image: formData.image.trim()
      };

      await coursService.create(coursData, token);

      setSuccess('✅ Cours créé avec succès !');
      setFormData({
        titre: '',
        description: '',
        duree: '',
        niveau: 'débutant',
        prix: '',
        estPremium: false,
        anneeAcademique: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        image: ''
      });

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
            <label>Durée *</label>
            <input
              type="text"
              className="input"
              name="duree"
              value={formData.duree}
              onChange={handleChange}
              placeholder="Ex: 12h"
              required
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
              {niveaux.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Prix</label>
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

        <div className="form-row">
          <div className="form-group">
            <label>Année académique *</label>
            <input
              type="text"
              className="input"
              name="anneeAcademique"
              value={formData.anneeAcademique}
              onChange={handleChange}
              placeholder="2025-2026"
              required
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              className="input"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="estPremium"
              checked={formData.estPremium}
              onChange={handleChange}
            />
            {' '}Cours premium
          </label>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Création...' : '➕ Créer le cours'}
        </button>
      </form>
    </div>
  );
}

export default CoursForm;
