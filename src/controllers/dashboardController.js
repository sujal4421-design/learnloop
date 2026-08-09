// src/controllers/dashboardController.js

const UserModel = require('../models/userModel');
const DashboardService = require('../services/dashboardService');

const DashboardController = {
  async index(req, res) {
    const [user, summary] = await Promise.all([
      UserModel.findById(req.session.userId),
      DashboardService.getSummary(req.session.userId)
    ]);

    res.render('dashboard', {
      userName: user ? user.name : 'there',
      summary
    });
  }
};

module.exports = DashboardController;
