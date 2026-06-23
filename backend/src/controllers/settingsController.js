const { User, UserSettings } = require('../../models');

const VALID_LANGUAGES = ['he', 'en'];
const DEFAULTS = { firstName: '', lastName: '', language: 'he', emailNotifications: false };

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

function fail(res, code, message, details = {}, status = 400) {
  return res.status(status).json({ success: false, data: null, error: { code, message, details } });
}

async function getSettings(req, res) {
  try {
    const userId = req.user.userId;
    const [settings, user] = await Promise.all([
      UserSettings.findByPk(userId),
      User.findByPk(userId, { attributes: ['firstName', 'lastName', 'email'] }),
    ]);
    const language = settings ? settings.language : 'he';
    const emailNotifications = settings ? settings.emailNotifications : false;
    const emailPart = user && user.email ? user.email.split('@')[0] : '';
    const firstName = (user && user.firstName) ? user.firstName : emailPart;
    const lastName = (user && user.lastName) ? user.lastName : '';
    ok(res, { firstName, lastName, language, emailNotifications });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function updateSettings(req, res) {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, language, emailNotifications } = req.body;
    if (!firstName || typeof firstName !== 'string' || !firstName.trim())
      return fail(res, 'VALIDATION_ERROR', 'First name is required', { field: 'firstName' });
    if (language && !VALID_LANGUAGES.includes(language))
      return fail(res, 'VALIDATION_ERROR', `language must be one of: ${VALID_LANGUAGES.join(', ')}`, { field: 'language' });
    const displayName = `${firstName.trim()} ${(lastName || '').trim()}`.trim();
    await Promise.all([
      User.update(
        { firstName: firstName.trim(), lastName: (lastName || '').trim(), updateDate: new Date() },
        { where: { userId } }
      ),
      UserSettings.upsert({
        userId,
        displayName,
        language: language || 'he',
        emailNotifications: !!emailNotifications,
      }),
    ]);
    ok(res, { firstName: firstName.trim(), lastName: (lastName || '').trim(), language: language || 'he', emailNotifications: !!emailNotifications });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

module.exports = { getSettings, updateSettings };
