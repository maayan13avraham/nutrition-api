const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/settingsController');

router.get('/', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.getSettings);
router.put('/', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.updateSettings);
router.get('/profile', authenticateToken, authorize('user'), ctrl.getProfile);
router.put('/profile', authenticateToken, authorize('user'), ctrl.updateProfile);
router.put('/saved-menu', authenticateToken, authorize('user'), ctrl.saveDailyMenu);

module.exports = router;
