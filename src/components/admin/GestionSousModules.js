import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const GestionSousModules = ({ moduleId, token, onRefresh }) => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartie, setEditingPartie] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'document',
    contenu: '',
    duree: '',
    estGratuit: false,
    url: ''
  });

  useEffect(() => {
    if (moduleId) {
      fetchParties();
    }
  }, [moduleId]);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/parties/module/${moduleId}`);
      setParties(response.data.parties || []);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPartie) {
        await axios.put(`${API_URL}/api/parties/${editingPartie._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/parties`, { ...formData, moduleId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowForm(false);
      setEditingPartie(null);
      setFormData({ titre: '', description: '', type: 'document', contenu: '', duree: '', estGratuit: false, url: '' });
      fetchParties();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce sous-module ?')) {
      try {
        await axios.delete(`${API_URL}/api/parties/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchParties();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const handleEdit = (partie) => {
    setEditingPartie(partie);
    setFormData({
      titre: partie.titre,
      description: partie.description || '',
      type: partie.type,
      contenu: partie.contenu || '',
      duree: partie.duree || '',
      estGratuit: partie.estGratuit || false,
      url: partie.url || ''
    });
    setShowForm(true);
  };

  const styles = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
    btnAdd: { backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    btnEdit: { backgroundColor: '#ffc107', color: '#333', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    btnDelete: { backgroundColor: '#dc3545', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' },
    th: { padding: '12px', backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '1px solid #ddd' },
    td: { padding: '12px', borderBottom: '1px solid #eee' },
    form: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' },
    input: { width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    textarea: { width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' },
    select: { width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }
  };

  if (loading) return <div>Chargement des sous-modules...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4>📋 Liste des sous-modules ({parties.length})</h4>
        <button style={styles.btnAdd} onClick={() => { setShowForm(true); setEditingPartie(null); setFormData({ titre: '', description: '', type: 'document', contenu: '', duree: '', estGratuit: false, url: '' }); }}>
          + Nouveau sous-module
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h4>{editingPartie ? '✏️ Modifier' : '➕ Ajouter'} un sous-module</h4>
          
          <label style={styles.label}>Titre *</label>
          <input style={styles.input} value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} required />
          
          <label style={styles.label}>Description</label>
          <textarea style={styles.textarea} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          
          <label style={styles.label}>Type</label>
          <select style={styles.select} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <option value="document">📄 Document</option>
            <option value="video">🎥 Vidéo</option>
            <option value="qcm">📝 QCM</option>
            <option value="exercice">✏️ Exercice</option>
            <option value="ressource">📎 Ressource</option>
          </select>
          
          <label style={styles.label}>Contenu</label>
          <textarea style={styles.textarea} value={formData.contenu} onChange={(e) => setFormData({...formData, contenu: e.target.value})} placeholder="Contenu HTML ou texte" />
          
          <label style={styles.label}>URL (pour vidéo ou ressource)</label>
          <input style={styles.input} value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://..." />
          
          <label style={styles.label}>Durée estimée</label>
          <input style={styles.input} value={formData.duree} onChange={(e) => setFormData({...formData, duree: e.target.value})} placeholder="Ex: 30 min" />
          
          <label style={styles.label}>
            <input type="checkbox" checked={formData.estGratuit} onChange={(e) => setFormData({...formData, estGratuit: e.target.checked})} />
            Accessible sans abonnement
          </label>
          
          <div style={{ marginTop: '15px' }}>
            <button type="submit" style={{ ...styles.btnAdd, marginRight: '10px' }}>💾 Sauvegarder</button>
            <button type="button" style={styles.btnDelete} onClick={() => { setShowForm(false); setEditingPartie(null); }}>❌ Annuler</button>
          </div>
        </form>
      )}

      <table style={styles.table}>
        <thead>
          <tr><th style={styles.th}>Titre</th><th style={styles.th}>Type</th><th style={styles.th}>Durée</th><th style={styles.th}>Actions</th></tr>
        </thead>
        <tbody>
          {parties.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>📭 Aucun sous-module</td></tr>
          ) : (
            parties.map(p => (
              <tr key={p._id}>
                <td style={styles.td}>
                  <strong>{p.titre}</strong><br />
                  <small style={{ color: '#666' }}>{p.description?.substring(0, 80)}...</small>
                </td>
                <td style={styles.td}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    backgroundColor: p.type === 'video' ? '#ffc107' : p.type === 'qcm' ? '#17a2b8' : '#6c757d',
                    color: 'white'
                  }}>{p.type}</span>
                </td>
                <td style={styles.td}>{p.duree || '-'}</td>
                <td style={styles.td}>
                  <button style={styles.btnEdit} onClick={() => handleEdit(p)}>✏️</button>
                  <button style={styles.btnDelete} onClick={() => handleDelete(p._id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GestionSousModules;
