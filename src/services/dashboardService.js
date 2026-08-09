// src/services/dashboardService.js
// Aggregates data from multiple models/services into one object for the dashboard view.
// This Service doesn't own any data itself — it just combines what already exists.

const LogModel = require('../models/logModel');
const StreakModel = require('../models/streakModel');
const RevisionService = require('./revisionService');

const DashboardService = {
  async getSummary(userId) {
    // Run everything in parallel — these queries don't depend on each other,
    // so there's no reason to wait for one before starting the next.
    const [totalLogs, categoryBreakdown, streak, revisionCounts, dueToday] = await Promise.all([
      LogModel.countTotalForUser(userId),
      LogModel.countByCategoryForUser(userId),
      StreakModel.findByUser(userId),
      RevisionService.getStatusCounts(userId),
      RevisionService.getDueToday(userId)
    ]);

    return {
      totalLogs,
      categoryBreakdown, // [{ category: 'DSA', count: 4 }, ...]
      currentStreak: streak ? streak.current_streak : 0,
      longestStreak: streak ? streak.longest_streak : 0,
      revisedCount: revisionCounts.revised,
      pendingCount: revisionCounts.pending,
      dueTodayCount: dueToday.length
    };
  }
};

module.exports = DashboardService;
