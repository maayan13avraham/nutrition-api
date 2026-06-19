const express = require('express');
const router = express.Router();
// Import authorization middleware and controller logic
const authorize = require('../middleware/auth');
const ctrl = require('../controllers/recipesController');
// Get all recipes (accessible by all roles)
router.get('/', authorize('admin', 'nutritionist', 'user'), ctrl.getRecipes);
// Get a single recipe by its ID (accessible by all roles)
router.get('/:id', authorize('admin', 'nutritionist', 'user'), ctrl.getRecipeById);
// Create a new recipe (restricted to admin and nutritionist)
router.post('/', authorize('admin', 'nutritionist'), ctrl.createRecipe);
// Update an existing recipe by ID (restricted to admin and nutritionist)
router.put('/:id', authorize('admin', 'nutritionist'), ctrl.updateRecipe);
// Delete a recipe from the database (restricted to admin only)
router.delete('/:id', authorize('admin'), ctrl.deleteRecipe);

module.exports = router;
