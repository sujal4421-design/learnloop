// src/services/logService.js

const LogModel = require('../models/logModel');
const RevisionService = require('./revisionService');
const StreakService = require('./streakService');
const AIService = require('./aiService');

function assertOwnership(log, userId) {
  if (!log) {
    const err = new Error('Log not found.');
    err.status = 404;
    throw err;
  }
  if (log.user_id !== userId) {
    const err = new Error('Log not found.');
    err.status = 404;
    throw err;
  }
}

function validateLogInput({ title, description, category }) {
  if (!title || !description || !category) {
    return 'Title, description, and category are all required.';
  }
  if (title.trim().length === 0 || description.trim().length === 0 || category.trim().length === 0) {
    return 'Fields cannot be empty or just spaces.';
  }
  if (title.trim().length > 150) {
    return 'Title must be under 150 characters.';
  }
  if (category.trim().length > 50) {
    return 'Category must be under 50 characters.';
  }
  if (description.trim().length > 2000) {
    return 'Description must be under 2000 characters.';
  }
  return null;
}

const LogService = {
  async createLog(userId, { title, description, category }) {
    const validationError = validateLogInput({ title, description, category });
    if (validationError) {
      const err = new Error(validationError);
      err.status = 400;
      throw err;
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();

    const logId = await LogModel.create({
      userId,
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory
    });

    const newLog = await LogModel.findById(logId);

    await RevisionService.scheduleForLog(logId, newLog.date_learned);
    await StreakService.recordActivity(userId);

    const aiSummary = await AIService.generateSummary(cleanTitle, cleanDescription);
    if (aiSummary) {
      await LogModel.updateAiSummary(logId, aiSummary);
      newLog.ai_summary = aiSummary;
    }

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

    const validationError = validateLogInput({ title, description, category });
    if (validationError) {
      const err = new Error(validationError);
      err.status = 400;
      throw err;
    }

    await LogModel.update(logId, {
      title: title.trim(),
      description: description.trim(),
      category: category.trim()
    });
    return LogModel.findById(logId);
  },

  async deleteLog(logId, userId) {
    const log = await LogModel.findById(logId);
    assertOwnership(log, userId);
    await LogModel.delete(logId);
  }
};

module.exports = LogService;
