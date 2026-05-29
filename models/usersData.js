// In-memory mock database array for users
let users = [
  { userId: 1, firstName: 'Maya', lastName: 'Cohen', email: 'maya@example.com', password: '123456', createDate: '2025-01-10T08:00:00Z', updateDate: '2025-01-10T08:00:00Z', userRole: 'admin' },
  { userId: 2, firstName: 'Avi', lastName: 'Levi', email: 'avi@example.com', password: '123456', createDate: '2025-01-12T09:00:00Z', updateDate: '2025-01-12T09:00:00Z', userRole: 'nutritionist' },
  { userId: 3, firstName: 'Dana', lastName: 'Israeli', email: 'dana@example.com', password: '123456', createDate: '2025-01-14T10:00:00Z', updateDate: '2025-01-14T10:00:00Z', userRole: 'user' },
  { userId: 4, firstName: 'Yossi', lastName: 'Ben-David', email: 'yossi@example.com', password: '123456', createDate: '2025-01-15T11:00:00Z', updateDate: '2025-01-15T11:00:00Z', userRole: 'user' },
  { userId: 5, firstName: 'Noa', lastName: 'Shapira', email: 'noa@example.com', password: '123456', createDate: '2025-01-16T12:00:00Z', updateDate: '2025-01-16T12:00:00Z', userRole: 'nutritionist' }
];

// Auto-increment counter for new user IDs
let nextId = 6;

// Return the entire array of users
function getAll() {
  return users;
}

// Find and return a single user by their unique ID
function getById(id) {
  return users.find(u => u.userId === id);
}

// Create a new user with generated ID and timestamps
function create(data) {
  const now = new Date().toISOString();
  const user = { userId: nextId++, ...data, createDate: now, updateDate: now };
  users.push(user);
  return user;
}

// Update existing user details by ID and refresh the update timestamp
function update(id, data) {
  const idx = users.findIndex(u => u.userId === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data, updateDate: new Date().toISOString() };
  return users[idx];
}

// Remove a user from the array by their ID
function remove(id) {
  const idx = users.findIndex(u => u.userId === id);
  if (idx === -1) return null;
  const removed = users[idx];
  users.splice(idx, 1);
  return removed;
}

module.exports = { getAll, getById, create, update, remove };
