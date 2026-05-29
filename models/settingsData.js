// In-memory mock settings store keyed by userId
const settings = {
  1: { displayName: 'Maya Cohen', language: 'he', emailNotifications: true },
  2: { displayName: 'Avi Levi', language: 'he', emailNotifications: false },
  3: { displayName: 'Dana Israeli', language: 'en', emailNotifications: true },
  4: { displayName: 'Yossi Ben-David', language: 'he', emailNotifications: true },
  5: { displayName: 'Noa Shapira', language: 'en', emailNotifications: false }
};

// Return settings for the given user, falling back to defaults if no entry exists
function getByUserId(userId) {
  return settings[userId] || { displayName: '', language: 'he', emailNotifications: false };
}

// Merge new values into the existing settings entry for the given user
function updateByUserId(userId, data) {
  settings[userId] = { ...getByUserId(userId), ...data };
  return settings[userId];
}

module.exports = { getByUserId, updateByUserId };
