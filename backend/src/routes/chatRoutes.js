const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ctrl = require('../controllers/chatController');

router.get('/history/:userId', authenticateToken, ctrl.getChatHistory);

module.exports = router;
