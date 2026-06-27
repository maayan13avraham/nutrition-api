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

async function getProfile(req, res) {
  try {
    const settings = await UserSettings.findByPk(req.user.userId);
    if (!settings || settings.age == null) return ok(res, null);
    ok(res, {
      age:           settings.age,
      weight:        settings.weight,
      height:        settings.height,
      goal:          settings.goal,
      activityLevel: settings.activityLevel,
      allergies:     settings.allergies ? JSON.parse(settings.allergies) : [],
      vegetarianOnly: settings.vegetarianOnly || false,
      savedMenu:     settings.savedMenu ? JSON.parse(settings.savedMenu) : null,
    });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function updateProfile(req, res) {
  try {
    const { age, weight, height, goal, activityLevel, allergies, vegetarianOnly } = req.body;
    await UserSettings.upsert({
      userId: req.user.userId,
      displayName: '',
      language: 'he',
      emailNotifications: false,
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      goal: goal || 'health',
      activityLevel: activityLevel || 'moderate',
      allergies: JSON.stringify(allergies || []),
      vegetarianOnly: !!vegetarianOnly,
    });
    ok(res, { age, weight, height, goal, activityLevel, allergies, vegetarianOnly });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function saveDailyMenu(req, res) {
  try {
    const { menu } = req.body;
    const settings = await UserSettings.findByPk(req.user.userId);
    if (!settings) return fail(res, 'NOT_FOUND', 'Profile not found', {}, 404);
    await settings.update({ savedMenu: menu ? JSON.stringify(menu) : null });
    ok(res, { saved: true });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

module.exports = { getSettings, updateSettings, getProfile, updateProfile, saveDailyMenu };
