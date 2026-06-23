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

// Register a new account with email + password; returns a JWT on success
export async function register(email, password) {
  const res = await api.post('/api/auth/register', { email, password });
  return res.data;
}
