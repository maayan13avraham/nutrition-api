const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/menuController');

router.post('/generate', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.generateMenu);

module.exports = router;
