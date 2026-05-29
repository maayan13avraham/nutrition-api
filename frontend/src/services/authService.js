import api from './api';

// Send login credentials to the server and return the authenticated user data
export async function login(email, password) {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data;
}

// Notify the server of session end (stateless server, primarily clears client state)
export async function logout() {
  const res = await api.post('/api/auth/logout');
  return res.data;
}
