const db = require('../models/recipesData');
// Array of allowed meal categories
const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

// Validate required fields and data types for recipe request bodies
function validateBody(body) {
  const { name, mealType, calories, protein, carbs, fat } = body;
  if (!name || typeof name !== 'string' || !name.trim())
    return { field: 'name', message: 'Missing required field: name' };
  if (!mealType || !VALID_MEAL_TYPES.includes(mealType))
    return { field: 'mealType', message: `mealType must be one of: ${VALID_MEAL_TYPES.join(', ')}` };
  if (calories === undefined || typeof calories !== 'number' || calories <= 0)
    return { field: 'calories', message: 'calories must be a positive number' };
  if (protein === undefined || typeof protein !== 'number' || protein < 0)
    return { field: 'protein', message: 'protein must be a non-negative number' };
  if (carbs === undefined || typeof carbs !== 'number' || carbs < 0)
    return { field: 'carbs', message: 'carbs must be a non-negative number' };
  if (fat === undefined || typeof fat !== 'number' || fat < 0)
    return { field: 'fat', message: 'fat must be a non-negative number' };
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

// Get all recipes with optional query parameter filtering
function getRecipes(req, res) {
  const { mealType, isVegetarian } = req.query;
  const filters = {};
  if (mealType) {
    if (!VALID_MEAL_TYPES.includes(mealType))
      return fail(res, 'VALIDATION_ERROR', `mealType must be one of: ${VALID_MEAL_TYPES.join(', ')}`, { field: 'mealType' });
    filters.mealType = mealType;
  }
  if (isVegetarian !== undefined) filters.isVegetarian = isVegetarian;
  ok(res, db.getAll(filters));
}

// Get a single recipe by its URL ID parameter
function getRecipeById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid recipe ID', { field: 'id' });
  const recipe = db.getById(id);
  if (!recipe) return fail(res, 'NOT_FOUND', `Recipe with id ${id} not found`, {}, 404);
  ok(res, recipe);
}

// Validate input data and save a new recipe entry
function createRecipe(req, res) {
  const err = validateBody(req.body);
  if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
  const { name, description, mealType, calories, protein, carbs, fat, isVegetarian, allergens, prepTime } = req.body;
  const recipe = db.create({
    name: name.trim(),
    description: description || '',
    mealType,
    calories,
    protein,
    carbs,
    fat,
    isVegetarian: !!isVegetarian,
    allergens: allergens || [],
    prepTime: prepTime || 0
  });
  ok(res, { recipeId: recipe.recipeId }, 201);
}

// Validate input data and update an existing recipe record
function updateRecipe(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid recipe ID', { field: 'id' });
  const err = validateBody(req.body);
  if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
  const { name, description, mealType, calories, protein, carbs, fat, isVegetarian, allergens, prepTime } = req.body;
  const recipe = db.update(id, {
    name: name.trim(),
    description: description || '',
    mealType,
    calories,
    protein,
    carbs,
    fat,
    isVegetarian: !!isVegetarian,
    allergens: allergens || [],
    prepTime: prepTime || 0
  });
  if (!recipe) return fail(res, 'NOT_FOUND', `Recipe with id ${id} not found`, {}, 404);
  ok(res, { recipeId: recipe.recipeId });
}

// Delete a recipe record from the system by ID
function deleteRecipe(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid recipe ID', { field: 'id' });
  const recipe = db.remove(id);
  if (!recipe) return fail(res, 'NOT_FOUND', `Recipe with id ${id} not found`, {}, 404);
  ok(res, { recipeId: recipe.recipeId });
}

module.exports = { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };
