import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

function AdminDashboard({ token }) {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/utilisateurs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Erreur utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  if (loading) return <div className="container"><div className="card">Chargement du dashboard...</div></div>;

  return (
    <div className="container">
      <h2>👑 Dashboard Administrateur</h2>
      
      <div className="card">
        <h3>📊 Statistiques</h3>
        <p>Total utilisateurs: {stats.totalUsers || users.length}</p>
        <p>Total cours: {stats.totalCourses || 0}</p>
      </div>
      
      <div className="card">
        <h3>👥 Utilisateurs inscrits</h3>
        <div className="cours-grid">
          {users.map(user => (
            <div key={user._id} className="card">
              <p><strong>{user.nom} {user.prenom}</strong></p>
              <p>Email: {user.email}</p>
              <p>Rôle: {user.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;