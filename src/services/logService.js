// src/services/logService.js
// Business logic, including ownership enforcement — a user may only
// view/edit/delete their OWN logs, verified here before the Model is touched.

const LogModel = require('../models/logModel');
const RevisionService = require('./revisionService');

function assertOwnership(log, userId) {
  if (!log) {
    const err = new Error('Log not found.');
    err.status = 404;
    throw err;
  }
  if (log.user_id !== userId) {
    // Deliberately the same "not found" message as above — we don't want to
    // reveal to an attacker that a log with this ID exists but belongs to
    // someone else. Same pattern as the vague auth error messages in Phase 8.
    const err = new Error('Log not found.');
    err.status = 404;
    throw err;
  }
}

const LogService = {
  async createLog(userId, { title, description, category }) {
    if (!title || !description || !category) {
      const err = new Error('Title, description, and category are all required.');
      err.status = 400;
      throw err;
    }

    const logId = await LogModel.create({ userId, title, description, category });

    const newLog = await LogModel.findById(logId);

    // Automatically schedule the 5 spaced revisions (Day 1/3/7/14/30)
    // based on this log's date_learned.
    await RevisionService.scheduleForLog(logId, newLog.date_learned);

    // NOTE: the Groq AI summary hooks in right here too, in an upcoming phase.

    return newLog;
  },

  async getUserLogs(userId) {
    return LogModel.findAllByUser(userId);
  },

  async getLogForUser(logId, userId) {
    const log = await LogModel.findById(logId);
    assertOwnership(log, userId);
    return log;
  },

  async updateLog(logId, userId, { title, description, category }) {
    const log = await LogModel.findById(logId);
    assertOwnership(log, userId);

    if (!title || !description || !category) {
      const err = new Error('Title, description, and category are all required.');
      err.status = 400;
      throw err;
    }

    await LogModel.update(logId, { title, description, category });
    return LogModel.findById(logId);
  },

  async deleteLog(logId, userId) {
    const log = await LogModel.findById(logId);
    assertOwnership(log, userId);
    await LogModel.delete(logId);
  }
};

module.exports = LogService;
