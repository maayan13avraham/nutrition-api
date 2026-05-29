const db = require('../models/usersData');

// Helper to format consistent success JSON responses
function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

// Helper to format consistent error JSON responses
function fail(res, code, message, details = {}, status = 400) {
  return res.status(status).json({ success: false, data: null, error: { code, message, details } });
}

// Match the provided credentials against the user store and return the session data on success.
// Returns distinct error codes for unknown email vs wrong password so the client can route
// new visitors to the registration/questionnaire flow instead of showing a generic error.
function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return fail(res, 'VALIDATION_ERROR', 'Email and password are required', {});
  const users = db.getAll();
  const userByEmail = users.find(u => u.email === email);
  if (!userByEmail)
    return fail(res, 'USER_NOT_FOUND', 'No account found with this email', {}, 401);
  if (userByEmail.password !== password)
    return fail(res, 'INVALID_PASSWORD', 'Incorrect password', {}, 401);
  const { userId, firstName, lastName, userRole } = userByEmail;
  return ok(res, { userId, firstName, lastName, userRole });
}

// Stateless logout — the server holds no session, so this simply confirms the action
function logout(req, res) {
  return ok(res, { message: 'Logged out successfully' });
}

module.exports = { login, logout };
