const { Recipe, Ingredient } = require('../../models');

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

function buildImageUrl(name, recipeId) {
  const prompt = encodeURIComponent(`${name}, food dish, appetizing, food photography, warm lighting, professional`);
  return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=280&nologo=true&seed=${recipeId}`;
}

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

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

function fail(res, code, message, details = {}, status = 400) {
  return res.status(status).json({ success: false, data: null, error: { code, message, details } });
}

function toResponse(recipe) {
  const plain = recipe.get ? recipe.get({ plain: true }) : recipe;
  return {
    recipeId: plain.recipeId,
    name: plain.name,
    description: plain.description,
    mealType: plain.mealType,
    calories: plain.calories,
    protein: plain.protein,
    carbs: plain.carbs,
    fat: plain.fat,
    isVegetarian: plain.isVegetarian,
    allergens: plain.allergens || [],
    prepTime: plain.prepTime,
    instructions: plain.instructions || [],
    ingredients: (plain.ingredients || []).map(i => ({ name: i.name, amount: i.amount })),
    imageUrl: plain.imageUrl || null,
    createDate: plain.createDate,
    updateDate: plain.updateDate,
  };
}

async function getRecipes(req, res) {
  try {
    const { mealType, isVegetarian } = req.query;
    const where = {};
    if (mealType) {
      if (!VALID_MEAL_TYPES.includes(mealType))
        return fail(res, 'VALIDATION_ERROR', `mealType must be one of: ${VALID_MEAL_TYPES.join(', ')}`, { field: 'mealType' });
      where.mealType = mealType;
    }
    if (isVegetarian !== undefined) where.isVegetarian = isVegetarian === 'true';
    const recipes = await Recipe.findAll({ where, include: [{ model: Ingredient, as: 'ingredients' }] });
    ok(res, recipes.map(toResponse));
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function getRecipeById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid recipe ID', { field: 'id' });
    const recipe = await Recipe.findByPk(id, { include: [{ model: Ingredient, as: 'ingredients' }] });
    if (!recipe) return fail(res, 'NOT_FOUND', `Recipe with id ${id} not found`, {}, 404);
    ok(res, toResponse(recipe));
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function createRecipe(req, res) {
  try {
    const err = validateBody(req.body);
    if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
    const { name, description, mealType, calories, protein, carbs, fat, isVegetarian, allergens, prepTime, ingredients, instructions } = req.body;
    const now = new Date();
    const recipe = await Recipe.create({
      name: name.trim(), description: description || '', mealType,
      calories, protein, carbs, fat,
      isVegetarian: !!isVegetarian,
      allergens: allergens || [],
      instructions: instructions || [],
      prepTime: prepTime || 0,
      createDate: now, updateDate: now,
    });
    await recipe.update({ imageUrl: buildImageUrl(recipe.name, recipe.recipeId) });
    if (Array.isArray(ingredients) && ingredients.length) {
      await Ingredient.bulkCreate(ingredients.map(i => ({ name: i.name, amount: i.amount, recipeId: recipe.recipeId })));
    }
    ok(res, { recipeId: recipe.recipeId }, 201);
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function updateRecipe(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid recipe ID', { field: 'id' });
    const err = validateBody(req.body);
    if (err) return fail(res, 'VALIDATION_ERROR', err.message, { field: err.field });
    const recipe = await Recipe.findByPk(id);
    if (!recipe) return fail(res, 'NOT_FOUND', `Recipe with id ${id} not found`, {}, 404);
    const { name, description, mealType, calories, protein, carbs, fat, isVegetarian, allergens, prepTime, ingredients, instructions } = req.body;
    await recipe.update({
      name: name.trim(), description: description || '', mealType,
      calories, protein, carbs, fat,
      isVegetarian: !!isVegetarian,
      allergens: allergens || [],
      instructions: instructions || [],
      prepTime: prepTime || 0,
      updateDate: new Date(),
    });
    if (Array.isArray(ingredients)) {
      await Ingredient.destroy({ where: { recipeId: id } });
      if (ingredients.length) {
        await Ingredient.bulkCreate(ingredients.map(i => ({ name: i.name, amount: i.amount, recipeId: id })));
      }
    }
    ok(res, { recipeId: recipe.recipeId });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

async function deleteRecipe(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return fail(res, 'VALIDATION_ERROR', 'Invalid recipe ID', { field: 'id' });
    const recipe = await Recipe.findByPk(id);
    if (!recipe) return fail(res, 'NOT_FOUND', `Recipe with id ${id} not found`, {}, 404);
    await recipe.destroy();
    ok(res, { recipeId: id });
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

module.exports = { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };
