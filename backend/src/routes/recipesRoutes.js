const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/recipesController');
// Get all recipes (accessible by all roles)
router.get('/', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.getRecipes);
// Get a single recipe by its ID (accessible by all roles)
router.get('/:id', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.getRecipeById);
// Create a new recipe (restricted to admin and nutritionist)
router.post('/', authenticateToken, authorize('admin', 'nutritionist'), ctrl.createRecipe);
// Update an existing recipe by ID (restricted to admin and nutritionist)
router.put('/:id', authenticateToken, authorize('admin', 'nutritionist'), ctrl.updateRecipe);
// Delete a recipe from the database (restricted to admin and nutritionist)
router.delete('/:id', authenticateToken, authorize('admin', 'nutritionist'), ctrl.deleteRecipe);

module.exports = router;
