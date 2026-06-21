const { UserSettings } = require('../../models');

const VALID_LANGUAGES = ['he', 'en'];
const DEFAULTS = { displayName: '', language: 'he', emailNotifications: false };

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

function fail(res, code, message, details = {}, status = 400) {
  return res.status(status).json({ success: false, data: null, error: { code, message, details } });
}

async function getSettings(req, res) {
  try {
    const userId = req.user.userId;
    const settings = await UserSettings.findByPk(userId);
    ok(res, settings || { ...DEFAULTS });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function updateSettings(req, res) {
  try {
    const userId = req.user.userId;
    const { displayName, language, emailNotifications } = req.body;
    if (!displayName || typeof displayName !== 'string' || !displayName.trim())
      return fail(res, 'VALIDATION_ERROR', 'displayName is required', { field: 'displayName' });
    if (language && !VALID_LANGUAGES.includes(language))
      return fail(res, 'VALIDATION_ERROR', `language must be one of: ${VALID_LANGUAGES.join(', ')}`, { field: 'language' });
    const values = { userId, displayName: displayName.trim(), language: language || 'he', emailNotifications: !!emailNotifications };
    const [settings] = await UserSettings.upsert(values);
    ok(res, settings);
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

module.exports = { getSettings, updateSettings };
