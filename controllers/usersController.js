const db = require('../models/usersData');

const VALID_ROLES = ['admin', 'nutritionist', 'user'];

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

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

function fail(res, code, message, details = {}, status = 400) {
  return res.status(status).json({ success: false, data: null, error: { code, message, details } });
}

function getUsers(req, res) {
  ok(res, db.getAll());
}

function getUserById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid user ID', { field: 'id' });
  const user = db.getById(id);
  if (!user) return fail(res, 'NOT_FOUND', `User with id ${id} not found`, {}, 404);
  ok(res, user);
}

function createUser(req, res) {
  const err = validateBody(req.body);
  if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
  const { firstName, lastName, userRole } = req.body;
  const user = db.create({ firstName: firstName.trim(), lastName: lastName.trim(), userRole });
  ok(res, { userId: user.userId }, 201);
}

function updateUser(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid user ID', { field: 'id' });
  const err = validateBody(req.body);
  if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
  const { firstName, lastName, userRole } = req.body;
  const user = db.update(id, { firstName: firstName.trim(), lastName: lastName.trim(), userRole });
  if (!user) return fail(res, 'NOT_FOUND', `User with id ${id} not found`, {}, 404);
  ok(res, { userId: user.userId });
}

function deleteUser(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid user ID', { field: 'id' });
  const user = db.remove(id);
  if (!user) return fail(res, 'NOT_FOUND', `User with id ${id} not found`, {}, 404);
  ok(res, { userId: user.userId });
}

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
