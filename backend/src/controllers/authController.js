const jwt = require('jsonwebtoken');
const { sequelize, User, UserSettings } = require('../../models');

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

async function register(req, res) {
  const t = await sequelize.transaction();
  try {
    const { email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || !password || password.length < 6) {
      await t.rollback();
      return fail(res, 'VALIDATION_ERROR', 'Valid email and password (min 6 chars) are required', {});
    }
    const existing = await User.findOne({ where: { email }, transaction: t });
    if (existing) {
      await t.rollback();
      return fail(res, 'EMAIL_TAKEN', 'An account with this email already exists', {}, 409);
    }
    const emailPrefix = email.split('@')[0];
    const parts = emailPrefix.split(/[._-]/);
    const firstName = parts[0] || emailPrefix;
    const lastName = parts.slice(1).join(' ') || '';
    const now = new Date();
    const user = await User.create(
      { firstName, lastName, email, password, userRole: 'user', createDate: now, updateDate: now },
      { transaction: t }
    );
    await UserSettings.create(
      { userId: user.userId, displayName: firstName, language: 'he', emailNotifications: true },
      { transaction: t }
    );
    await t.commit();
    const token = jwt.sign({ userId: user.userId, userRole: 'user' }, JWT_SECRET, { expiresIn: '8h' });
    ok(res, { token, userId: user.userId, firstName, lastName, userRole: 'user' }, 201);
  } catch (err) {
    await t.rollback();
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

module.exports = { login, logout, register };
