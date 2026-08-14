// src/services/revisionService.js

const RevisionModel = require('../models/revisionModel');

const INTERVALS_IN_DAYS = [1, 3, 7, 14, 30];

function addDays(baseDateStr, days) {
  // Anchor to UTC midnight explicitly — avoids any local-timezone shift
  // when the date is later formatted back into a string.
  const d = new Date(`${baseDateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

const RevisionService = {
  // Called once, right after a log is created (hooked in from logService.createLog).
  async scheduleForLog(logId, dateLearned) {
    const scheduledDates = INTERVALS_IN_DAYS.map(days => addDays(dateLearned, days));
    await RevisionModel.bulkCreate(logId, scheduledDates);
  },

  async getDueToday(userId) {
    return RevisionModel.findDueForUser(userId);
  },

  async markRevised(revisionId, userId) {
    const revision = await RevisionModel.findById(revisionId);

    if (!revision || revision.user_id !== userId) {
      // Same "not found for anyone but the owner" pattern as logs/auth.
      const err = new Error('Revision not found.');
      err.status = 404;
      throw err;
    }
    if (revision.status === 'revised') {
      return; // already done — nothing to do, not an error
    }

    await RevisionModel.markRevised(revisionId);
  },

  async getStatusCounts(userId) {
    const rows = await RevisionModel.countByStatusForUser(userId);
    const counts = { pending: 0, revised: 0 };
    rows.forEach(row => { counts[row.status] = row.count; });
    return counts;
  }
};

module.exports = RevisionService;
