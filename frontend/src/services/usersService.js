import api from './api';

// Fetch the profile of the currently logged-in user based on the session headers
export async function getMe() {
  const res = await api.get('/api/users/me');
  return res.data;
}

// Update the email and/or password of the currently logged-in user
export async function updateMe(data) {
  const res = await api.put('/api/users/me', data);
  return res.data;
}
