import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const ModuleProgressif = ({ coursId }) => {
  const [modules, setModules] = useState([]);
  const [progression, setProgression] = useState(0);
  const [abonnement, setAbonnement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModulesAccessibles();
  }, [coursId]);

  const fetchModulesAccessibles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/modules/accessibles/${coursId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setModules(response.data.modules);
      setProgression(response.data.progression);
      setAbonnement(response.data.abonnement);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '20px'
    },
    progressionBar: {
      backgroundColor: '#e0e0e0',
      borderRadius: '10px',
      height: '20px',
      marginBottom: '20px',
      overflow: 'hidden'
    },
    progressionFill: {
      backgroundColor: '#28a745',
      height: '100%',
      width: `${progression}%`,
      transition: 'width 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px'
    },
    moduleCard: (accessible) => ({
      backgroundColor: accessible ? '#ffffff' : '#f0f0f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      border: accessible ? '1px solid #28a745' : '1px solid #ddd',
      opacity: accessible ? 1 : 0.6,
      cursor: accessible ? 'pointer' : 'not-allowed'
    }),
    moduleTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    moduleStatus: (accessible) => ({
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      backgroundColor: accessible ? '#28a745' : '#ffc107',
      color: 'white'
    })
  };

  if (loading) return <div>Chargement des modules...</div>;

  return (
    <div style={styles.container}>
      <h2>📚 Progression du cours</h2>
      
      <div style={styles.progressionBar}>
        <div style={styles.progressionFill}>
          {progression}%
        </div>
      </div>

      {abonnement && (
        <div style={{ marginBottom: '20px' }}>
          <p>📅 Semaine {abonnement.semaineActuelle} / {abonnement.totalSemaines}</p>
          <p>💎 Abonnement: {abonnement.type === '6_mois' ? '6 mois' : abonnement.type === '9_mois' ? '9 mois' : '12 mois'}</p>
        </div>
      )}

      {modules.map((module) => (
        <div
          key={module._id}
          style={styles.moduleCard(module.accessible)}
          onClick={() => {
            if (module.accessible) {
              window.location.href = `/module/${module._id}`;
            }
          }}
        >
          <div style={styles.moduleTitle}>
            Semaine {module.numeroSemaine}: {module.titre}
          </div>
          <div style={styles.moduleStatus(module.accessible)}>
            {module.accessible ? '✅ Débloqué' : `🔒 Débloqué dans ${module.debloqueDans} semaine(s)`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModuleProgressif;