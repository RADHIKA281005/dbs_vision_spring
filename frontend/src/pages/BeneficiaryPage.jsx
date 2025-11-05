// @ts-nocheck

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import useAuthStore from '../store/auth.store.js';
import db from '../services/localDB.js';


// --- Inline Styles (Same as before) ---
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
  formContainer: {
    backgroundColor: '#1F2937', // gray-800
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // 2 columns
    gap: '20px',
  },
  formInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #4B5563', // gray-600
    backgroundColor: '#374151', // gray-700
    color: 'white',
    boxSizing: 'border-box', // Important for padding
  },
  formButton: {
    gridColumn: '1 / -1', // Span both columns
    padding: '12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#3B82F6', // blue-500
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  errorText: {
    color: '#EF4444', // red-500
    gridColumn: '1 / -1',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    backgroundColor: '#374151', // gray-700
    color: 'white',
    padding: '12px 15px',
    textAlign: 'left',
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #374151',
  },
  // New style for offline items
  offlineRow: {
    backgroundColor: '#374151', // A slightly different background
    fontStyle: 'italic',
  }
};
// --- End Styles ---

function BeneficiaryPage() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user); // Get the user object

  const [formState, setFormState] = useState({
    beneficiaryId: '',
    fullName: '',
    age: '',
    location: '',
    gender: 'Prefer not to say', // Add gender to form
  });
  const [formError, setFormError] = useState('');

  // 2. --- UPDATED fetchBeneficiaries ---
  const fetchBeneficiaries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // A. Fetch from API
      const response = await api.get('/beneficiaries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // --- FIX 1: Your backend returns the array at response.data.data ---
      const onlineData = (response.data.data || []).map(b => ({ ...b, isSynced: 1 }));

      // B. Fetch from local Dexie DB
      const offlineData = await db.beneficiaries.where('isSynced').equals(0).toArray();
      
      // C. Combine lists
      setBeneficiaries([...offlineData, ...onlineData]);

    } catch (err) {
      setError('Failed to fetch beneficiaries. You may be offline.');
      // If API fails, AT LEAST load from local DB
      try {
        const offlineData = await db.beneficiaries.where('isSynced').equals(0).toArray();
        setBeneficiaries(offlineData);
      } catch (dexieError) {
        console.error("Dexie failed to load:", dexieError);
        setError('CRITICAL: Failed to load online or offline data.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // 3. --- UPDATED handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formState.beneficiaryId || !formState.fullName || !formState.age || !formState.location) {
      setFormError('All fields are required.');
      return;
    }

    const newBeneficiaryData = {
      ...formState,
      age: Number(formState.age),
      // --- FIX 2: Add a check for user (user?._id) ---
      registeredBy: user?._id, // Add the user who registered
    };

    // If we can't find the user, stop.
    if (!newBeneficiaryData.registeredBy) {
      setFormError('Could not find logged in user. Please log out and log back in.');
      return;
    }

    // --- THIS IS THE OFFLINE-FIRST LOGIC ---
    if (navigator.onLine) {
      // We are ONLINE: Send to backend API
      try {
        await api.post('/beneficiaries', newBeneficiaryData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Refresh the table from the server
        fetchBeneficiaries(); 

      } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to create beneficiary.');
        console.error(err);
      }
    } else {
      // We are OFFLINE: Send to local Dexie DB
      try {
        await db.beneficiaries.add({
          ...newBeneficiaryData,
          isSynced: 0 // Mark as not synced
        });

        // Refresh the table (which will pull from Dexie)
        fetchBeneficiaries();
        alert('You are offline. Beneficiary saved locally and will sync when you are back online.');

      } catch (err) {
        // This will trigger if the 'beneficiaryId' is not unique
        setFormError(err.message || 'Failed to save beneficiary locally.');
        console.error(err);
      }
    }
    // --- END OFFLINE LOGIC ---

    // Clear the form
    setFormState({
      beneficiaryId: '',
      fullName: '',
      age: '',
      location: '',
      gender: 'Prefer not to say',
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Beneficiary Management</h1>
      
      <div style={styles.formContainer}>
        <h2 style={{...styles.title, fontSize: '22px', marginBottom: '20px'}}>
          Add New Beneficiary
        </h2>
        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Inputs for beneficiaryId, fullName, age, location */}
          <input
            type="text"
            name="beneficiaryId"
            placeholder="Beneficiary ID (e.g., A-123)"
            style={styles.formInput}
            value={formState.beneficiaryId}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            style={styles.formInput}
            value={formState.fullName}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            style={styles.formInput}
            value={formState.age}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location (e.g., Remote Village)"
            style={styles.formInput}
            value={formState.location}
            onChange={handleInputChange}
          />
          {/* Gender Select */}
          <select 
            name="gender" 
            style={styles.formInput}
            value={formState.gender}
            onChange={handleInputChange}
          >
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {formError && <p style={styles.errorText}>{formError}</p>}
          
          <button type="submit" style={styles.formButton}>
            Add Beneficiary
          </button>
        </form>
      </div>

      {loading && <p>Loading beneficiaries...</p>}
      {error && <p style={styles.errorText}>{error}</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Full Name</th>
            <th style={styles.th}>Age</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {beneficiaries.map((b) => (
            // Apply special style if not synced
            <tr key={b.beneficiaryId || b.id} style={!b.isSynced ? styles.offlineRow : {}}>
              <td style={styles.td}>{b.beneficiaryId}</td>
              <td style={styles.td}>{b.fullName}</td>
              <td style={styles.td}>{b.age}</td>
              <td style={styles.td}>{b.location}</td>
              <td style={styles.td}>
                {b.isSynced ? 'Synced' : 'Offline'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BeneficiaryPage;