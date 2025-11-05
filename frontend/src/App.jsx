import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useCallback } from 'react';
import useAuthStore from './store/auth.store.js';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import BeneficiaryPage from './pages/BeneficiaryPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import Sidebar from './components/Sidebar.jsx';

// --- OFFLINE SYNC IMPORTS ---
import db from './services/localDB.js'; // Using the correct 'localDB.js' casing
import api from './services/api.js';

// This is a new component to protect our pages
function ProtectedLayout() {
  return (
    <div style={{ display: 'flex', backgroundColor: '#111827', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="beneficiaries" element={<BeneficiaryPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
 
  // ✅ Fix 1: Avoid object destructuring that triggers rerenders
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const token = useAuthStore((state) => state.token);

// ✅ Fix 2: Define sync function normally (not inside useCallback)
const syncOfflineBeneficiaries = async () => {
  if (!token) return;

  console.log('Checking for offline data to sync...');
  try {
    const unsynced = await db.beneficiaries.where('isSynced').equals(0).toArray();
    if (unsynced.length === 0) {
      console.log('No offline data to sync.');
      return;
    }

    for (const b of unsynced) {
      try {
        const payload = { ...b };
        delete payload.id;
        delete payload.isSynced;

        await api.post('/beneficiaries', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        await db.beneficiaries.update(b.id, { isSynced: 1 });
        console.log(`✅ Synced beneficiary: ${b.fullName}`);
      } catch (err) {
        console.error(`❌ Failed to sync ${b.fullName}:`, err);
        if (err.response?.status === 409) {
          await db.beneficiaries.update(b.id, { isSynced: 1 });
        }
      }
    }

    console.log('🎉 Offline data synced successfully');
  } catch (err) {
    console.error('Sync failed:', err);
  }
};

// ✅ Fix 3: Simplify effects to prevent infinite loops
useEffect(() => {
  if (!isAuthenticated || !token) return;

  const handleOnline = () => syncOfflineBeneficiaries();

  window.addEventListener('online', handleOnline);
  syncOfflineBeneficiaries(); // run once after login

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}, [isAuthenticated, token]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;

/*

*/ 