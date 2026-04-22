import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const AnneeAcademiqueMenu = ({ onSelectAnnee, selectedAnnee, coursCount }) => {
  const [annees, setAnnees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnneesAcademiques();
  }, []);

  const fetchAnneesAcademiques = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cours/annees`);
      setAnnees(response.data.annees);
      if (response.data.annees.length > 0 && !selectedAnnee) {
        onSelectAnnee && onSelectAnnee(response.data.annees[0]);
      }
    } catch (error) {
      console.error('Erreur chargement années:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      marginBottom: '20px'
    },
    dropdown: {
      position: 'relative',
      display: 'inline-block',
      width: '100%',
      maxWidth: '350px'
    },
    dropdownButton: {
      backgroundColor: '#1a1a2e',
      color: 'white',
      padding: '14px 20px',
      fontSize: '16px',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s'
    },
    dropdownContent: {
      display: isOpen ? 'block' : 'none',
      position: 'absolute',
      backgroundColor: 'white',
      minWidth: '100%',
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
      borderRadius: '12px',
      zIndex: 1,
      marginTop: '5px',
      overflow: 'hidden'
    },
    dropdownItem: {
      padding: '12px 20px',
      cursor: 'pointer',
      borderBottom: '1px solid #eee',
      transition: 'background 0.2s',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    badge: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '12px'
    }
  };

  if (loading) {
    return <div style={styles.container}>📅 Chargement des années...</div>;
  }

  return (
    <div style={styles.container}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        📅 Année académique
      </label>
      <div style={styles.dropdown}>
        <button 
          style={styles.dropdownButton} 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedAnnee || 'Sélectionner une année'}</span>
          <span>{isOpen ? '▲' : '▼'}</span>
        </button>
        <div style={styles.dropdownContent}>
          {annees.map((annee, idx) => (
            <div
              key={idx}
              style={styles.dropdownItem}
              onClick={() => {
                onSelectAnnee(annee);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <span>📚 {annee}</span>
              {selectedAnnee === annee && <span style={styles.badge}>✓ Actif</span>}
            </div>
          ))}
        </div>
      </div>
      {coursCount !== undefined && (
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          {coursCount} cours disponibles pour {selectedAnnee}
        </p>
      )}
    </div>
  );
};

export default AnneeAcademiqueMenu;