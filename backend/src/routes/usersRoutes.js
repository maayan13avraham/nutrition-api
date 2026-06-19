const express = require('express');
const router = express.Router();
// Import authorization middleware and controller logic
const authorize = require('../middleware/auth');
const ctrl = require('../controllers/usersController');
// Specific /me routes must be declared before /:id to avoid param capture
router.get('/me', authorize('admin', 'nutritionist', 'user'), ctrl.getMe);
router.put('/me', authorize('admin', 'nutritionist', 'user'), ctrl.updateMe);
// Favorite recipes — many-to-many: User ↔ Recipe via junction table
router.get('/me/favorites', authorize('admin', 'nutritionist', 'user'), ctrl.getFavorites);
router.post('/me/favorites/:recipeId', authorize('admin', 'nutritionist', 'user'), ctrl.addFavorite);
router.delete('/me/favorites/:recipeId', authorize('admin', 'nutritionist', 'user'), ctrl.removeFavorite);
// General user CRUD
router.get('/', authorize('admin', 'nutritionist'), ctrl.getUsers);
router.get('/:id', authorize('admin', 'nutritionist', 'user'), ctrl.getUserById);
router.post('/', authorize('admin'), ctrl.createUser);
router.put('/:id', authorize('admin', 'nutritionist', 'user'), ctrl.updateUser);
router.delete('/:id', authorize('admin'), ctrl.deleteUser);

module.exports = router;
