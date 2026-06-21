import axios from 'axios';

// Create a shared axios instance pointing at the backend API base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Attach the JWT Bearer token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export default api;
