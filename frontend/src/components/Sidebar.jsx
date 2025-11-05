import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/auth.store';

// Inline Styles
const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: '#1F2937', // gray-800
    color: 'white',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flexGrow: 1,
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    fontSize: '16px',
  },
  // We'll add a simple "hover" effect by managing state,
  // but for now, we'll rely on the browser's default for Link
  
  logoutButton: {
    padding: '10px 15px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#EF4444', // red-500
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userInfo: {
    borderTop: '1px solid #4B5563', // gray-600
    paddingTop: '15px',
    marginTop: '20px',
  },
  userName: {
    textAlign: 'center',
    fontWeight: 'bold',
  }
};

function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div style={styles.sidebar}>
      <h1 style={styles.title}>Vision Spring</h1>
      <nav style={styles.nav}>
        <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
        <Link to="/beneficiaries" style={styles.navLink}>Beneficiaries</Link>
        <Link to="/inventory" style={styles.navLink}>Inventory</Link>
      </nav>

      <div style={styles.userInfo}>
        <p style={styles.userName}>{user?.fullName}</p>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;