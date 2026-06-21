const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/usersController');
// Specific /me routes must be declared before /:id to avoid param capture
router.get('/me', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.getMe);
router.put('/me', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.updateMe);
// Favorite recipes — many-to-many: User ↔ Recipe via junction table
router.get('/me/favorites', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.getFavorites);
router.post('/me/favorites/:recipeId', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.addFavorite);
router.delete('/me/favorites/:recipeId', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.removeFavorite);
// General user CRUD
router.get('/', authenticateToken, authorize('admin', 'nutritionist'), ctrl.getUsers);
router.get('/:id', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.getUserById);
router.post('/', authenticateToken, authorize('admin'), ctrl.createUser);
router.put('/:id', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.updateUser);
router.delete('/:id', authenticateToken, authorize('admin'), ctrl.deleteUser);

module.exports = router;
