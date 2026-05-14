const express = require('express');
const router = express.Router();
const authorize = require('../middleware/auth');
const ctrl = require('../controllers/usersController');

router.get('/', authorize('admin', 'nutritionist'), ctrl.getUsers);
router.get('/:id', authorize('admin', 'nutritionist', 'user'), ctrl.getUserById);
router.post('/', authorize('admin'), ctrl.createUser);
router.put('/:id', authorize('admin', 'nutritionist', 'user'), ctrl.updateUser);
router.delete('/:id', authorize('admin'), ctrl.deleteUser);

module.exports = router;
