const express = require('express');
const router = express.Router();
const authorize = require('../middleware/auth');
const ctrl = require('../controllers/recipesController');

router.get('/', authorize('admin', 'nutritionist', 'user'), ctrl.getRecipes);
router.get('/:id', authorize('admin', 'nutritionist', 'user'), ctrl.getRecipeById);
router.post('/', authorize('admin', 'nutritionist'), ctrl.createRecipe);
router.put('/:id', authorize('admin', 'nutritionist'), ctrl.updateRecipe);
router.delete('/:id', authorize('admin'), ctrl.deleteRecipe);

module.exports = router;
