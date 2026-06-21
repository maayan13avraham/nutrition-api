const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/settingsController');

router.get('/', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.getSettings);
router.put('/', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.updateSettings);

module.exports = router;
