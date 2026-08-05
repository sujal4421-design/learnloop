// src/routes/dashboardRoutes.js
// Temporary placeholder — the real dashboard (Phase — Dashboard) will pull
// actual stats via DashboardController + DashboardService.

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const UserModel = require('../models/userModel');

router.get('/', requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.session.userId);
  res.render('dashboard', { userName: user ? user.name : 'there' });
});

module.exports = router;
