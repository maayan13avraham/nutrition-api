const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

// Auth routes are public — no authorization middleware applied
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

module.exports = router;
