import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'video', label: 'Vidéo' },
  { value: 'qcm', label: 'QCM' },
  { value: 'exercice', label: 'Exercice' },
  { value: 'reponse', label: 'Réponse' },
  { value: 'ressource', label: 'Ressource' }
];

const emptyQuestion = () => ({
  texte: '',
  propositions: ['', ''],
  bonneReponse: '',
  commentaire: '',
  explication: '',
  points: 1
});

const emptyContenu = (kind = 'document') => ({
  kind,
  titre: '',
  texte: '',
  url: '',
  fichierUrl: '',
  fichierNom: '',
  mimeType: '',
  extension: '',
  ordre: 0,
  questions: kind === 'qcm' ? [emptyQuestion()] : [],
  pointsMax: kind === 'exercice' ? 20 : 0
});

const emptyForm = {
  titre: '',
  description: '',
  duree: '',
  estGratuit: false,
  typesDisponibles: [],
  contenus: []
};

const GestionSousModules = ({ moduleId, token, onRefresh }) => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartie, setEditingPartie] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if (moduleId) {
      fetchParties();
    } else {
      setParties([]);
      setLoading(false);
    }
  }, [moduleId]);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/parties/module/${moduleId}`, authConfig);
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
    setUploadingIndex(null);
  };

  const toggleType = (typeValue) => {
    setFormData((prev) => {
      const exists = prev.typesDisponibles.includes(typeValue);

      if (exists) {
        return {
          ...prev,
          typesDisponibles: prev.typesDisponibles.filter((t) => t !== typeValue),
          contenus: prev.contenus.filter((c) => c.kind !== typeValue)
        };
      }

      return {
        ...prev,
        typesDisponibles: [...prev.typesDisponibles, typeValue],
        contenus: [...prev.contenus, emptyContenu(typeValue)]
      };
    });
  };

  const updateContenu = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      contenus: prev.contenus.map((contenu, i) =>
        i === index ? { ...contenu, [field]: value } : contenu
      )
    }));
  };

  const addQuestion = (contenuIndex) => {
    setFormData((prev) => ({
      ...prev,
      contenus: prev.contenus.map((contenu, i) =>
        i === contenuIndex
          ? { ...contenu, questions: [...(contenu.questions || []), emptyQuestion()] }
          : contenu
      )
    }));
  };

  const removeQuestion = (contenuIndex, questionIndex) => {
    setFormData((prev) => ({
      ...prev,
      contenus: prev.contenus.map((contenu, i) =>
        i === contenuIndex
          ? {
              ...contenu,
              questions: (contenu.questions || []).filter((_, qIndex) => qIndex !== questionIndex)
            }
          : contenu
      )
    }));
  };

  const updateQuestion = (contenuIndex, questionIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      contenus: prev.contenus.map((contenu, i) =>
        i === contenuIndex
          ? {
              ...contenu,
              questions: (contenu.questions || []).map((question, qIndex) =>
                qIndex === questionIndex ? { ...question, [field]: value } : question
              )
            }
          : contenu
      )
    }));
  };

  const updateQuestionProposition = (contenuIndex, questionIndex, propositionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      contenus: prev.contenus.map((contenu, i) =>
        i === contenuIndex
          ? {
              ...contenu,
              questions: (contenu.questions || []).map((question, qIndex) =>
                qIndex === questionIndex
                  ? {
                      ...question,
                      propositions: (question.propositions || []).map((prop, pIndex) =>
                        pIndex === propositionIndex ? value : prop
                      )
                    }
                  : question
              )
            }
          : contenu
      )
    }));
  };

  const addQuestionProposition = (contenuIndex, questionIndex) => {
    setFormData((prev) => ({
      ...prev,
      contenus: prev.contenus.map((contenu, i) =>
        i === contenuIndex
          ? {
              ...contenu,
              questions: (contenu.questions || []).map((question, qIndex) =>
                qIndex === questionIndex
                  ? { ...question, propositions: [...(question.propositions || []), ''] }
                  : question
              )
            }
          : contenu
      )
    }));
  };

  const removeQuestionProposition = (contenuIndex, questionIndex, propositionIndex) => {
    setFormData((prev) => ({
      ...prev,
      contenus: prev.contenus.map((contenu, i) =>
        i === contenuIndex
          ? {
              ...contenu,
              questions: (contenu.questions || []).map((question, qIndex) =>
                qIndex === questionIndex
                  ? {
                      ...question,
                      propositions: (question.propositions || []).filter(
                        (_, pIndex) => pIndex !== propositionIndex
                      )
                    }
                  : question
              )
            }
          : contenu
      )
    }));
  };

  const uploadFile = async (index, file) => {
    if (!file) return;

    try {
      setUploadingIndex(index);

      const body = new FormData();
      body.append('file', file);

      const response = await axios.post(`${API_URL}/api/upload`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploaded = response.data.file;

      setFormData((prev) => ({
        ...prev,
        contenus: prev.contenus.map((contenu, i) =>
          i === index
            ? {
                ...contenu,
                fichierUrl: uploaded.url,
                fichierNom: uploaded.nom,
                mimeType: uploaded.mimeType,
                extension: uploaded.extension
              }
            : contenu
        )
      }));
    } catch (error) {
      console.error('Erreur upload:', error);
      alert(error.response?.data?.message || 'Erreur upload fichier');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        moduleId,
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        duree: formData.duree.trim(),
        estGratuit: formData.estGratuit,
        type: formData.typesDisponibles[0] || 'document',
        typesDisponibles: formData.typesDisponibles,
        contenu: '',
        url: '',
        contenus: formData.contenus.map((contenu, index) => ({
          ...contenu,
          titre: contenu.titre.trim(),
          texte: contenu.texte.trim(),
          url: contenu.url.trim(),
          ordre: index,
          questions: (contenu.questions || []).map((question) => ({
            ...question,
            texte: question.texte.trim(),
            propositions: (question.propositions || []).map((p) => p.trim()).filter(Boolean),
            bonneReponse: question.bonneReponse.trim(),
            commentaire: question.commentaire.trim(),
            explication: question.explication.trim(),
            points: Number(question.points || 1)
          })),
          pointsMax: Number(contenu.pointsMax || 0)
        }))
      };

      if (editingPartie) {
        await axios.put(`${API_URL}/api/parties/${editingPartie._id}`, payload, authConfig);
      } else {
        await axios.post(`${API_URL}/api/parties`, payload, authConfig);
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
    const types = partie.typesDisponibles?.length
      ? partie.typesDisponibles
      : partie.type
      ? [partie.type]
      : [];

    setEditingPartie(partie);
    setFormData({
      titre: partie.titre || '',
      description: partie.description || '',
      duree: partie.duree || '',
      estGratuit: partie.estGratuit || false,
      typesDisponibles: types,
      contenus: partie.contenus?.length
        ? partie.contenus
        : types.map((t) => emptyContenu(t))
    });
    setShowForm(true);
  };

  if (!moduleId) {
    return <div style={{ marginTop: '20px' }}>Choisis un module pour gérer ses sous-modules.</div>;
  }

  if (loading) {
    return <div style={{ marginTop: '20px' }}>Chargement des sous-modules...</div>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
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
        <form
          onSubmit={handleSubmit}
          style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          <h4>{editingPartie ? '✏️ Modifier' : '➕ Ajouter'} un sous-module</h4>

          <div style={{ marginBottom: '10px' }}>
            <label>Titre *</label>
            <input
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '8px', minHeight: '80px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Durée</label>
            <input
              value={formData.duree}
              onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
              style={{ width: '100%', padding: '8px' }}
              placeholder="Ex: 30 min"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={formData.estGratuit}
                onChange={(e) => setFormData({ ...formData, estGratuit: e.target.checked })}
              />
              {' '}Accessible sans abonnement
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <strong>Types de contenu de cette partie</strong>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '8px',
                marginTop: '10px'
              }}
            >
              {TYPES.map((type) => (
                <label key={type.value}>
                  <input
                    type="checkbox"
                    checked={formData.typesDisponibles.includes(type.value)}
                    onChange={() => toggleType(type.value)}
                  />
                  {' '}{type.label}
                </label>
              ))}
            </div>
          </div>

          {formData.contenus.map((contenu, index) => (
            <div
              key={`${contenu.kind}-${index}`}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                background: '#fafafa'
              }}
            >
              <h5 style={{ marginTop: 0 }}>
                Bloc {index + 1} : {TYPES.find((t) => t.value === contenu.kind)?.label || contenu.kind}
              </h5>

              <div style={{ marginBottom: '10px' }}>
                <label>Titre du bloc</label>
                <input
                  value={contenu.titre}
                  onChange={(e) => updateContenu(index, 'titre', e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label>Contenu texte</label>
                <textarea
                  value={contenu.texte}
                  onChange={(e) => updateContenu(index, 'texte', e.target.value)}
                  style={{ width: '100%', padding: '8px', minHeight: '80px' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label>URL externe</label>
                <input
                  value={contenu.url}
                  onChange={(e) => updateContenu(index, 'url', e.target.value)}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label>Uploader un fichier</label>
                <input
                  type="file"
                  onChange={(e) => uploadFile(index, e.target.files?.[0])}
                  style={{ width: '100%' }}
                />
                {uploadingIndex === index && <div>Upload en cours...</div>}
                {contenu.fichierUrl && (
                  <div style={{ marginTop: '8px', color: 'green' }}>
                    Fichier lié : {contenu.fichierNom || contenu.fichierUrl}
                  </div>
                )}
              </div>

              {contenu.kind === 'qcm' && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Questions QCM</strong>

                  {(contenu.questions || []).map((question, questionIndex) => (
                    <div
                      key={questionIndex}
                      style={{
                        border: '1px dashed #bbb',
                        padding: '12px',
                        borderRadius: '6px',
                        marginTop: '10px'
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <label>Question</label>
                        <input
                          value={question.texte}
                          onChange={(e) =>
                            updateQuestion(index, questionIndex, 'texte', e.target.value)
                          }
                          style={{ width: '100%', padding: '8px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label>Propositions</label>
                        {(question.propositions || []).map((prop, propositionIndex) => (
                          <div key={propositionIndex} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <input
                              value={prop}
                              onChange={(e) =>
                                updateQuestionProposition(index, questionIndex, propositionIndex, e.target.value)
                              }
                              style={{ flex: 1, padding: '8px' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeQuestionProposition(index, questionIndex, propositionIndex)}
                            >
                              Suppr.
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          style={{ marginTop: '8px' }}
                          onClick={() => addQuestionProposition(index, questionIndex)}
                        >
                          + Ajouter proposition
                        </button>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label>Bonne réponse</label>
                        <input
                          value={question.bonneReponse}
                          onChange={(e) =>
                            updateQuestion(index, questionIndex, 'bonneReponse', e.target.value)
                          }
                          style={{ width: '100%', padding: '8px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label>Commentaire</label>
                        <textarea
                          value={question.commentaire}
                          onChange={(e) =>
                            updateQuestion(index, questionIndex, 'commentaire', e.target.value)
                          }
                          style={{ width: '100%', padding: '8px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label>Explication</label>
                        <textarea
                          value={question.explication}
                          onChange={(e) =>
                            updateQuestion(index, questionIndex, 'explication', e.target.value)
                          }
                          style={{ width: '100%', padding: '8px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label>Points</label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(index, questionIndex, 'points', e.target.value)
                          }
                          style={{ width: '100%', padding: '8px' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeQuestion(index, questionIndex)}
                      >
                        🗑️ Supprimer question
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    style={{ marginTop: '10px' }}
                    onClick={() => addQuestion(index)}
                  >
                    + Ajouter question QCM
                  </button>
                </div>
              )}

              {contenu.kind === 'exercice' && (
                <div style={{ marginTop: '15px' }}>
                  <label>Note maximale de l'exercice</label>
                  <input
                    type="number"
                    min="1"
                    value={contenu.pointsMax}
                    onChange={(e) => updateContenu(index, 'pointsMax', e.target.value)}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
              )}
            </div>
          ))}

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
          <div
            key={p._id}
            style={{
              borderBottom: '1px solid #ddd',
              padding: '12px 0'
            }}
          >
            <strong>{p.titre}</strong>
            <div style={{ color: '#666', marginTop: '4px' }}>
              {p.description || 'Sans description'}
            </div>
            <div style={{ marginTop: '6px' }}>
              Types : {(p.typesDisponibles || [p.type]).join(', ')}
            </div>
            <div style={{ marginTop: '6px' }}>
              Blocs de contenu : {p.contenus?.length || 0}
            </div>
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

