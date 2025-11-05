import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import useAuthStore from '../store/auth.store.js';

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
  formSelect: { // Style for the dropdown
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #4B5563', // gray-600
    backgroundColor: '#374151', // gray-700
    color: 'white',
    boxSizing: 'border-box',
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
};
// --- End Styles ---

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useAuthStore((state) => state.token);

  // --- New State for the Form ---
  const [formState, setFormState] = useState({
    itemName: '',
    itemType: 'Glasses', // Default value
    quantity: '',
    location: '',
  });
  const [formError, setFormError] = useState('');

  // --- Wrap fetch in useCallback ---
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInventory(response.data.data);
    } catch (err) {
      setError('Failed to fetch inventory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // --- Fetch data on load ---
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // --- Handle form input changes ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // --- Handle form submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formState.itemName || !formState.quantity || !formState.location) {
      setFormError('Item Name, Quantity, and Location are required.');
      return;
    }

    try {
      // 1. Call backend to create new item
      await api.post('/inventory', {
        ...formState,
        quantity: Number(formState.quantity) // Ensure quantity is a number
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 2. Clear the form
      setFormState({
        itemName: '',
        itemType: 'Glasses',
        quantity: '',
        location: '',
      });
      
      // 3. Refresh the table
      fetchInventory();

    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create inventory item.');
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Inventory Management</h1>
      
      {/* --- NEW FORM --- */}
      <div style={styles.formContainer}>
        <h2 style={{...styles.title, fontSize: '22px', marginBottom: '20px'}}>
          Add New Inventory Item
        </h2>
        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="itemName"
            placeholder="Item Name (e.g., Reading Glasses +1.5)"
            style={styles.formInput}
            value={formState.itemName}
            onChange={handleInputChange}
          />
          <select 
            name="itemType" 
            style={styles.formSelect}
            value={formState.itemType}
            onChange={handleInputChange}
          >
            <option value="Glasses">Glasses</option>
            <option value="Medicine">Medicine</option>
            <option value="Equipment">Equipment</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            style={styles.formInput}
            value={formState.quantity}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location (e.g., Main Storage)"
            style={styles.formInput}
            value={formState.location}
            onChange={handleInputChange}
          />

          {formError && <p style={styles.errorText}>{formError}</p>}
          
          <button type="submit" style={styles.formButton}>
            Add Item
          </button>
        </form>
      </div>
      {/* --- END NEW FORM --- */}

      {loading && <p>Loading inventory...</p>}
      {error && <p style={styles.errorText}>{error}</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Item Name</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>Location</th>
            {/* --- THIS IS THE FIXED LINE --- */}
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item._id}>
              <td style={styles.td}>{item.itemName}</td>
              <td style={styles.td}>{item.itemType}</td>
              <td style={styles.td}>{item.quantity}</td>
              <td style={styles.td}>{item.location}</td>
              <td style={styles.td}>
                <button style={{color: '#3B82F6'}}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryPage;