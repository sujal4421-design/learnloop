// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const catchAsync = require('../utils/catchAsync');
const { authLimiter } = require('../middleware/rateLimiter');

router.get('/register', AuthController.showRegisterForm);
router.post('/register', authLimiter, catchAsync(AuthController.register));

router.get('/login', AuthController.showLoginForm);
router.post('/login', authLimiter, catchAsync(AuthController.login));

router.post('/logout', AuthController.logout);

module.exports = router;
