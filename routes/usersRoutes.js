const express = require('express');
const router = express.Router();
// Import authorization middleware and controller logic
const authorize = require('../middleware/auth');
const ctrl = require('../controllers/usersController');
// Get a list of all users (restricted to admin and nutritionist)
router.get('/', authorize('admin', 'nutritionist'), ctrl.getUsers);
// Get a specific user's profile by ID (accessible by all roles)
router.get('/:id', authorize('admin', 'nutritionist', 'user'), ctrl.getUserById);
// Create a new user account (restricted to admin only)
router.post('/', authorize('admin'), ctrl.createUser);
// Update a user's details by ID (accessible by all roles)
router.put('/:id', authorize('admin', 'nutritionist', 'user'), ctrl.updateUser);
// Permanent deletion of a user profile (restricted to admin only)
router.delete('/:id', authorize('admin'), ctrl.deleteUser);

module.exports = router;
