// src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const DashboardController = require('../controllers/dashboardController');
const catchAsync = require('../utils/catchAsync');

router.get('/', requireAuth, catchAsync(DashboardController.index));

module.exports = router;
