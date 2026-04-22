import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const AbonnementCard = ({ type, label, duree, prix, onSubscribe }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/abonnements/creer`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        onSubscribe && onSubscribe(response.data.abonnement);
        alert(`✅ Abonnement ${label} créé avec succès !`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la création de l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s',
      cursor: 'pointer'
    },
    duree: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: '10px'
    },
    prix: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#28a745',
      marginBottom: '20px'
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      width: '100%'
    }
  };

  return (
    <div style={styles.card}>
      <h3>{label}</h3>
      <div style={styles.duree}>{duree} mois</div>
      <div style={styles.prix}>{prix.toLocaleString()} FCFA</div>
      <button 
        style={styles.button} 
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? 'Chargement...' : `Souscrire ${label}`}
      </button>
    </div>
  );
};

export default AbonnementCard;