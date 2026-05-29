import api from './api';

// Retrieve the display preferences for the currently logged-in user
export async function getSettings() {
  const res = await api.get('/api/settings');
  return res.data;
}

// Save updated display preferences (display name, language, notifications) for the current user
export async function updateSettings(data) {
  const res = await api.put('/api/settings', data);
  return res.data;
}
