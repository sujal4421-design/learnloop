// src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const DashboardController = require('../controllers/dashboardController');

router.get('/', requireAuth, DashboardController.index);

module.exports = router;
