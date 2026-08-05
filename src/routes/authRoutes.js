// src/routes/authRoutes.js
// Maps URLs to Controller functions. No logic lives here — just wiring.

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

router.get('/register', AuthController.showRegisterForm);
router.post('/register', AuthController.register);

router.get('/login', AuthController.showLoginForm);
router.post('/login', AuthController.login);

router.post('/logout', AuthController.logout);

module.exports = router;
