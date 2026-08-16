// src/controllers/dashboardController.js

const UserModel = require('../models/userModel');
const DashboardService = require('../services/dashboardService');
const LogService = require('../services/logService');
const RevisionService = require('../services/revisionService');

const DashboardController = {
  async index(req, res) {
    const userId = req.session.userId;
    const [user, summary, logs, dueRevisions] = await Promise.all([
      UserModel.findById(userId),
      DashboardService.getSummary(userId),
      LogService.getUserLogs(userId),
      RevisionService.getDueToday(userId)
    ]);

    res.render('dashboard', {
      userName: user ? user.name : 'there',
      summary,
      logs,
      dueRevisions
    });
  }
};

module.exports = DashboardController;
