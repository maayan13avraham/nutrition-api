const db = require('../models/usersData');

// Array of allowed access levels and system roles
const VALID_ROLES = ['admin', 'nutritionist', 'user'];

// Validate required fields and options for user request bodies
function validateBody(body) {
  const { firstName, lastName, userRole } = body;
  if (!firstName || typeof firstName !== 'string' || !firstName.trim())
    return { field: 'firstName', message: 'Missing required field: firstName' };
  if (!lastName || typeof lastName !== 'string' || !lastName.trim())
    return { field: 'lastName', message: 'Missing required field: lastName' };
  if (!userRole || !VALID_ROLES.includes(userRole))
    return { field: 'userRole', message: `userRole must be one of: ${VALID_ROLES.join(', ')}` };
  return null;
}

// Helper to format consistent success JSON responses
function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

// Helper to format consistent error JSON responses
function fail(res, code, message, details = {}, status = 400) {
  return res.status(status).json({ success: false, data: null, error: { code, message, details } });
}

// Fetch and return the list of all registered users
function getUsers(req, res) {
  ok(res, db.getAll());
}

// Return the profile of the currently logged-in user based on x-user-id header
function getMe(req, res) {
  const userId = parseInt(req.headers['x-user-id']);
  if (isNaN(userId)) return fail(res, 'VALIDATION_ERROR', 'Missing x-user-id header', { field: 'x-user-id' });
  const user = db.getById(userId);
  if (!user) return fail(res, 'NOT_FOUND', `User with id ${userId} not found`, {}, 404);
  ok(res, user);
}

// Update email and/or password for the currently logged-in user
function updateMe(req, res) {
  const userId = parseInt(req.headers['x-user-id']);
  if (isNaN(userId)) return fail(res, 'VALIDATION_ERROR', 'Missing x-user-id header', { field: 'x-user-id' });
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    return fail(res, 'VALIDATION_ERROR', 'Valid email is required', { field: 'email' });
  if (password !== undefined && password !== '' && password.length < 6)
    return fail(res, 'VALIDATION_ERROR', 'Password must be at least 6 characters', { field: 'password' });
  const updates = { email: email.trim() };
  if (password) updates.password = password;
  const user = db.update(userId, updates);
  if (!user) return fail(res, 'NOT_FOUND', `User with id ${userId} not found`, {}, 404);
  ok(res, { userId: user.userId });
}

// Fetch a single user profile matching the URL ID parameter
function getUserById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid user ID', { field: 'id' });
  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role === 'user' && id !== requesterId)
    return fail(res, 'FORBIDDEN', 'You can only access your own data', {}, 403);
  const user = db.getById(id);
  if (!user) return fail(res, 'NOT_FOUND', `User with id ${id} not found`, {}, 404);
  ok(res, user);
}

// Validate field data and register a new user in the system
function createUser(req, res) {
  const err = validateBody(req.body);
  if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
  const { firstName, lastName, userRole } = req.body;
  const user = db.create({ firstName: firstName.trim(), lastName: lastName.trim(), userRole });
  ok(res, { userId: user.userId }, 201);
}

// Validate and apply changes to an existing user profile
function updateUser(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid user ID', { field: 'id' });
  const role = req.headers['x-user-role'];
  const requesterId = parseInt(req.headers['x-user-id']);
  if (role === 'user' && id !== requesterId)
    return fail(res, 'FORBIDDEN', 'You can only update your own data', {}, 403);
  const err = validateBody(req.body);
  if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
  const { firstName, lastName, userRole } = req.body;
  const user = db.update(id, { firstName: firstName.trim(), lastName: lastName.trim(), userRole });
  if (!user) return fail(res, 'NOT_FOUND', `User with id ${id} not found`, {}, 404);
  ok(res, { userId: user.userId });
}

// Permanently delete a user account matching the request ID
function deleteUser(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid user ID', { field: 'id' });
  const user = db.remove(id);
  if (!user) return fail(res, 'NOT_FOUND', `User with id ${id} not found`, {}, 404);
  ok(res, { userId: user.userId });
}

module.exports = { getUsers, getMe, updateMe, getUserById, createUser, updateUser, deleteUser };
