import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const emptyForm = {
  titre: '',
  description: '',
  type: 'document',
  contenu: '',
  duree: '',
  estGratuit: false,
  url: ''
};

const GestionSousModules = ({ moduleId, token, onRefresh }) => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartie, setEditingPartie] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (moduleId) {
      fetchParties();
    } else {
      setParties([]);
      setLoading(false);
    }
  }, [moduleId]);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/parties/module/${moduleId}`);
      setParties(response.data.parties || []);
    } catch (error) {
      console.error('Erreur chargement parties:', error);
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPartie(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPartie) {
        await axios.put(
          `${API_URL}/api/parties/${editingPartie._id}`,
          { ...formData, titre: formData.titre.trim(), description: formData.description.trim() },
          authConfig
        );
      } else {
        await axios.post(
          `${API_URL}/api/parties`,
          {
            ...formData,
            titre: formData.titre.trim(),
            description: formData.description.trim(),
            moduleId
          },
          authConfig
        );
      }

      resetForm();
      await fetchParties();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erreur sauvegarde partie:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce sous-module ?')) return;

    try {
      await axios.delete(`${API_URL}/api/parties/${id}`, authConfig);
      await fetchParties();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erreur suppression partie:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleEdit = (partie) => {
    setEditingPartie(partie);
    setFormData({
      titre: partie.titre || '',
      description: partie.description || '',
      type: partie.type || 'document',
      contenu: partie.contenu || '',
      duree: partie.duree || '',
      estGratuit: partie.estGratuit || false,
      url: partie.url || ''
    });
    setShowForm(true);
  };

  if (!moduleId) {
    return <div style={{ marginTop: '20px' }}>Choisis un module pour gérer ses sous-modules.</div>;
  }

  if (loading) return <div>Chargement des sous-modules...</div>;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h4>📋 Liste des sous-modules ({parties.length})</h4>
        <button
          onClick={() => {
            setEditingPartie(null);
            setFormData(emptyForm);
            setShowForm(true);
          }}
        >
          + Nouveau sous-module
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4>{editingPartie ? '✏️ Modifier' : '➕ Ajouter'} un sous-module</h4>

          <label>Titre *</label>
          <input
            value={formData.titre}
            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
            required
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          />

          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', marginBottom: '10px', padding: '8px', minHeight: '80px' }}
          />

          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          >
            <option value="document">Document</option>
            <option value="video">Vidéo</option>
            <option value="qcm">QCM</option>
            <option value="exercice">Exercice</option>
            <option value="ressource">Ressource</option>
          </select>

          <label>Contenu</label>
          <textarea
            value={formData.contenu}
            onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
            style={{ width: '100%', marginBottom: '10px', padding: '8px', minHeight: '80px' }}
          />

          <label>URL</label>
          <input
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            placeholder="https://..."
          />

          <label>Durée</label>
          <input
            value={formData.duree}
            onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            placeholder="Ex: 30 min"
          />

          <label style={{ display: 'block', marginBottom: '15px' }}>
            <input
              type="checkbox"
              checked={formData.estGratuit}
              onChange={(e) => setFormData({ ...formData, estGratuit: e.target.checked })}
            />
            {' '}Accessible sans abonnement
          </label>

          <button type="submit" style={{ marginRight: '10px' }}>
            💾 Sauvegarder
          </button>
          <button type="button" onClick={resetForm}>
            Annuler
          </button>
        </form>
      )}

      {parties.length === 0 ? (
        <div>📭 Aucun sous-module</div>
      ) : (
        parties.map((p) => (
          <div key={p._id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
            <strong>{p.titre}</strong> - {p.type} - {p.duree || '-'}
            <div style={{ marginTop: '8px' }}>
              <button onClick={() => handleEdit(p)} style={{ marginRight: '8px' }}>
                ✏️ Modifier
              </button>
              <button onClick={() => handleDelete(p._id)}>
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GestionSousModules;

