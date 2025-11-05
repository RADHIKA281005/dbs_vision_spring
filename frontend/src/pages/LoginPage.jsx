import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/auth.store';
import api from '../services/api';

// Simple inline styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#111827', // dark gray
    color: 'white',
    fontFamily: 'sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '30px',
    backgroundColor: '#1F2937', // lighter gray
    borderRadius: '8px',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    color: 'black',
  },
  button: {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#3B82F6', // blue
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  error: {
    color: '#EF4444', // red
  },
};

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // This is where we call your backend!
      const response = await api.post('/users/login', { email, password });
      
      const { user, accessToken } = response.data.data;
      
      // Save user to our store
      login(user, accessToken);

      // Send to dashboard
      navigate('/dashboard');

    } catch (err) {
      setError('Login failed. Please check your email and password.');
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={{ fontSize: '24px', textAlign: 'center' }}>
          Vision Spring Login
        </h2>
        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;