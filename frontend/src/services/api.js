import axios from 'axios';

// Create a shared axios instance pointing at the backend API base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Attach user identity headers to every outgoing request using the stored session
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.userId) config.headers['x-user-id'] = user.userId;
  if (user.userRole) config.headers['x-user-role'] = user.userRole;
  return config;
});

export default api;
