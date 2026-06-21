const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

function fail(res, code, message, details = {}, status = 400) {
  return res.status(status).json({ success: false, data: null, error: { code, message, details } });
}

// Returns distinct error codes for unknown email vs wrong password so the client can route
// new visitors to the registration/questionnaire flow instead of showing a generic error.
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return fail(res, 'VALIDATION_ERROR', 'Email and password are required', {});
    const user = await User.findOne({ where: { email } });
    if (!user)
      return fail(res, 'USER_NOT_FOUND', 'No account found with this email', {}, 401);
    if (user.password !== password)
      return fail(res, 'INVALID_PASSWORD', 'Incorrect password', {}, 401);
    const { userId, firstName, lastName, userRole } = user;
    const token = jwt.sign({ userId, userRole }, JWT_SECRET, { expiresIn: '8h' });
    return ok(res, { token, userId, firstName, lastName, userRole });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

function logout(req, res) {
  return ok(res, { message: 'Logged out successfully' });
}

module.exports = { login, logout };
