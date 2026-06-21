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

// Admin: fetch all users
export async function getUsers() {
  const res = await api.get('/api/users');
  return res.data;
}

// Admin: update any user's fields (firstName, lastName, userRole required by backend)
export async function updateUser(id, data) {
  const res = await api.put(`/api/users/${id}`, data);
  return res.data;
}

// Admin: delete any user by id
export async function deleteUser(id) {
  const res = await api.delete(`/api/users/${id}`);
  return res.data;
}
