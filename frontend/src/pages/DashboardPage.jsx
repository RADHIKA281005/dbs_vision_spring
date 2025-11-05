import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/auth.store.js';
import api from '../services/api.js';

// --- Inline Styles ---
const styles = {
  container: {
    padding: '30px',
    color: 'white',
    width: '100%',
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
    gap: '20px',
  },
  statCard: {
    backgroundColor: '#1F2937', // gray-800
    padding: '24px',
    borderRadius: '8px',
  },
  statLabel: {
    fontSize: '16px',
    color: '#D1D5DB', // gray-300
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '40px',
    fontWeight: 'bold',
    color: 'white',
  },
  errorText: {
    color: '#EF4444', // red-500
    fontSize: '18px',
  }
};
// --- End Styles ---

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        // This is where we call your backend!
        // This endpoint is protected by verifyJWT and verifyAdmin
        const response = await api.get('/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setStats(response.data.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access Forbidden: Only admins can view this page.');
        } else {
          setError('Failed to fetch dashboard stats.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // We only fetch stats if the user is an admin
    if (user?.role === 'admin') {
      fetchStats();
    } else {
      setLoading(false);
      // This is a normal staff user, not an admin
      setError('Welcome! You do not have permission to view admin stats.');
    }
  }, [token, user]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome, {user?.fullName}!</h1>
      
      {loading && <p>Loading dashboard...</p>}
      
      {error && <p style={styles.errorText}>{error}</p>}

      {stats && (
        <div style={styles.statsGrid}>
          {/* Stat Card 1 */}
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Beneficiaries</p>
            <p style={styles.statValue}>{stats.totalBeneficiaries}</p>
          </div>

          {/* Stat Card 2 */}
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Inventory Items</p>
            <p style={styles.statValue}>{stats.totalInventoryItems}</p>
          </div>

          {/* Stat Card 3 */}
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Staff Users</p>
            <p style={styles.statValue}>{stats.totalUsers}</p>
          </div>
          
          {/* Stat Card 4 */}
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Stock Quantity</p>
            <p style={styles.statValue}>{stats.totalStockQuantity}</p>
          </div>

          {/* Stat Card 5 */}
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Items Low on Stock</p>
            <p style={styles.statValue}>{stats.itemsLowStock}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
