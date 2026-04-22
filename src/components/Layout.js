import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    onLogout && onLogout();
    navigate('/');
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fb'
    },
    sidebar: {
      width: sidebarOpen ? '280px' : '80px',
      backgroundColor: '#1a1a2e',
      color: 'white',
      transition: 'width 0.3s',
      position: 'fixed',
      height: '100vh',
      overflowY: 'auto',
      zIndex: 100
    },
    sidebarHeader: {
      padding: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    sidebarContent: {
      padding: '20px'
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      marginBottom: '20px'
    },
    userAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#007bff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      marginBottom: '10px'
    },
    userName: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    userRole: {
      fontSize: '12px',
      color: '#aaa',
      marginBottom: '10px'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 15px',
      borderRadius: '8px',
      marginBottom: '5px',
      cursor: 'pointer',
      transition: 'background 0.3s',
      textDecoration: 'none',
      color: 'white'
    },
    mainContent: {
      marginLeft: sidebarOpen ? '280px' : '80px',
      flex: 1,
      padding: '20px',
      transition: 'margin-left 0.3s'
    },
    toggleBtn: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '18px'
    }
  };

  const navItems = [
    { icon: '📊', label: 'Dashboard', path: '/' },
    { icon: '📚', label: 'Mes cours', path: '/mes-cours' },
    { icon: '💎', label: 'Abonnement', path: '/abonnement' },
    { icon: '📝', label: 'QCM', path: '/qcm' },
    { icon: '👥', label: 'Communauté', path: '/communaute' }
  ];

  if (user?.role === 'admin') {
    navItems.push({ icon: '👑', label: 'Admin Panel', path: '/admin' });
  }

  return (
    <div style={styles.container}>
      {/* Sidebar gauche - User/Admin vertical */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3>{sidebarOpen ? '📚 Concours BF' : '📚'}</h3>
          <button style={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Informations utilisateur verticales */}
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user?.prenom?.[0] || user?.nom?.[0] || '👤'}
          </div>
          {sidebarOpen && (
            <>
              <div style={styles.userName}>{user?.prenom} {user?.nom}</div>
              <div style={styles.userRole}>
                {user?.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
              </div>
              <div style={{ fontSize: '11px', color: '#aaa' }}>{user?.email}</div>
            </>
          )}
        </div>

        {/* Navigation verticale */}
        <div style={styles.sidebarContent}>
          {navItems.map((item, idx) => (
            <Link key={idx} to={item.path} style={styles.navItem}>
              <span style={{ marginRight: '12px' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
          
          <div style={styles.navItem} onClick={handleLogout}>
            <span style={{ marginRight: '12px' }}>🚪</span>
            {sidebarOpen && <span>Déconnexion</span>}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={styles.mainContent}>
        {children}
      </div>
    </div>
  );
};

export default Layout;