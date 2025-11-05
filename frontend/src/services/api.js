import axios from 'axios';

// This points to your backend server!
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

export default api;