const express = require('express');
const router = express.Router();
const authorize = require('../middleware/auth');
const ctrl = require('../controllers/settingsController');

router.get('/', authorize('admin', 'nutritionist', 'user'), ctrl.getSettings);
router.put('/', authorize('admin', 'nutritionist', 'user'), ctrl.updateSettings);

module.exports = router;
