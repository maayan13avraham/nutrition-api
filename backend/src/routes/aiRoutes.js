const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/aiController');

router.post('/chat', authenticateToken, authorize('admin', 'nutritionist', 'user'), ctrl.chat);

module.exports = router;
