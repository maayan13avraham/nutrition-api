const db = require('../models/settingsData');

// Language codes supported by the application
const VALID_LANGUAGES = ['he', 'en'];

// Helper to format consistent success JSON responses
function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

// Helper to format consistent error JSON responses
function fail(res, code, message, details = {}, status = 400) {
  return res.status(status).json({ success: false, data: null, error: { code, message, details } });
}

// Return the display preferences for the user identified by the x-user-id header
function getSettings(req, res) {
  const userId = parseInt(req.headers['x-user-id']);
  if (isNaN(userId)) return fail(res, 'VALIDATION_ERROR', 'Missing x-user-id header', {});
  return ok(res, db.getByUserId(userId));
}

// Validate and persist updated display preferences for the current user
function updateSettings(req, res) {
  const userId = parseInt(req.headers['x-user-id']);
  if (isNaN(userId)) return fail(res, 'VALIDATION_ERROR', 'Missing x-user-id header', {});
  const { displayName, language, emailNotifications } = req.body;
  if (!displayName || typeof displayName !== 'string' || !displayName.trim())
    return fail(res, 'VALIDATION_ERROR', 'displayName is required', { field: 'displayName' });
  if (language && !VALID_LANGUAGES.includes(language))
    return fail(res, 'VALIDATION_ERROR', `language must be one of: ${VALID_LANGUAGES.join(', ')}`, { field: 'language' });
  const updated = db.updateByUserId(userId, {
    displayName: displayName.trim(),
    language: language || 'he',
    emailNotifications: !!emailNotifications
  });
  return ok(res, updated);
}

module.exports = { getSettings, updateSettings };
