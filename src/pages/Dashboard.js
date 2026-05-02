import React, { useState } from 'react';
import API from '../services/api';

function Dashboard({ user }) {
  const [loading, setLoading] = useState(false);

  const payer = async () => {
    try {
      setLoading(true);

      const payload = {
        montant: 1000,
        email: user?.email,
        telephone: user?.telephone || '',
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        coursNom: 'Abonnement mensuel'
      };

      const res = await API.post('/api/payment/init-cinetpay', payload);

      if (res.data?.payment_url) {
        window.location.href = res.data.payment_url;
        return;
      }

      alert(res.data?.message || 'URL de paiement introuvable');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h2>Tableau de bord</h2>

      <div
        style={{
          background: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      >
        <p><strong>Nom :</strong> {user?.nom || '-'}</p>
        <p><strong>Prénom :</strong> {user?.prenom || '-'}</p>
        <p><strong>Email :</strong> {user?.email || '-'}</p>
        <p><strong>Numéro WhatsApp :</strong> {user?.telephone || 'Non renseigné'}</p>
      </div>

      <button
        className="btn"
        onClick={payer}
        disabled={loading}
        style={{
          padding: '12px 18px',
          backgroundColor: '#0d6efd',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Redirection...' : '💳 Payer abonnement'}
      </button>
    </div>
  );
}

export default Dashboard;
