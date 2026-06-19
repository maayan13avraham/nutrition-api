const express = require('express');
const router = express.Router();
const authorize = require('../middleware/auth');
const ctrl = require('../controllers/aiController');

router.post('/chat', authorize('admin', 'nutritionist', 'user'), ctrl.chat);

module.exports = router;
