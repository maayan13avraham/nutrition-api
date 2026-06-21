const { User, Recipe, UserFavoriteRecipe } = require('../../models');

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

async function getUsers(req, res) {
  try {
    const users = await User.findAll();
    ok(res, users);
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function getMe(req, res) {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);
    if (!user) return fail(res, 'NOT_FOUND', `User with id ${userId} not found`, {}, 404);
    ok(res, user);
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function updateMe(req, res) {
  try {
    const userId = req.user.userId;
    const { email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email))
      return fail(res, 'VALIDATION_ERROR', 'Valid email is required', { field: 'email' });
    if (password !== undefined && password !== '' && password.length < 6)
      return fail(res, 'VALIDATION_ERROR', 'Password must be at least 6 characters', { field: 'password' });
    const user = await User.findByPk(userId);
    if (!user) return fail(res, 'NOT_FOUND', `User with id ${userId} not found`, {}, 404);
    const updates = { email: email.trim(), updateDate: new Date() };
    if (password) updates.password = password;
    await user.update(updates);
    ok(res, { userId: user.userId });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function getUserById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid user ID', { field: 'id' });
    const role = req.user.userRole;
    const requesterId = req.user.userId;
    if (role === 'user' && id !== requesterId)
      return fail(res, 'FORBIDDEN', 'You can only access your own data', {}, 403);
    const user = await User.findByPk(id);
    if (!user) return fail(res, 'NOT_FOUND', `User with id ${id} not found`, {}, 404);
    ok(res, user);
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function createUser(req, res) {
  try {
    const err = validateBody(req.body);
    if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
    const { firstName, lastName, userRole } = req.body;
    const now = new Date();
    const user = await User.create({ firstName: firstName.trim(), lastName: lastName.trim(), userRole, createDate: now, updateDate: now });
    ok(res, { userId: user.userId }, 201);
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function updateUser(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid user ID', { field: 'id' });
    const role = req.user.userRole;
    const requesterId = req.user.userId;
    if (role === 'user' && id !== requesterId)
      return fail(res, 'FORBIDDEN', 'You can only update your own data', {}, 403);
    const err = validateBody(req.body);
    if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
    const user = await User.findByPk(id);
    if (!user) return fail(res, 'NOT_FOUND', `User with id ${id} not found`, {}, 404);
    const { firstName, lastName, userRole } = req.body;
    await user.update({ firstName: firstName.trim(), lastName: lastName.trim(), userRole, updateDate: new Date() });
    ok(res, { userId: user.userId });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid user ID', { field: 'id' });
    const user = await User.findByPk(id);
    if (!user) return fail(res, 'NOT_FOUND', `User with id ${id} not found`, {}, 404);
    await user.destroy();
    ok(res, { userId: id });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

// Favorites — many-to-many: User ↔ Recipe via user_favorite_recipes junction
async function getFavorites(req, res) {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);
    if (!user) return fail(res, 'NOT_FOUND', `User with id ${userId} not found`, {}, 404);
    const favorites = await user.getFavoriteRecipes();
    ok(res, favorites);
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function addFavorite(req, res) {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.recipeId);
    if (isNaN(recipeId)) return fail(res, 'VALIDATION_ERROR', 'Invalid recipe ID', { field: 'recipeId' });
    const user = await User.findByPk(userId);
    if (!user) return fail(res, 'NOT_FOUND', `User with id ${userId} not found`, {}, 404);
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) return fail(res, 'NOT_FOUND', `Recipe with id ${recipeId} not found`, {}, 404);
    await user.addFavoriteRecipe(recipe);
    ok(res, { userId, recipeId });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function removeFavorite(req, res) {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.recipeId);
    if (isNaN(recipeId)) return fail(res, 'VALIDATION_ERROR', 'Invalid recipe ID', { field: 'recipeId' });
    const user = await User.findByPk(userId);
    if (!user) return fail(res, 'NOT_FOUND', `User with id ${userId} not found`, {}, 404);
    await UserFavoriteRecipe.destroy({ where: { userId, recipeId } });
    ok(res, { userId, recipeId });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

module.exports = { getUsers, getMe, updateMe, getUserById, createUser, updateUser, deleteUser, getFavorites, addFavorite, removeFavorite };
