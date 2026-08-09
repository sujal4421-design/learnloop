// src/models/streakModel.js
// Full streak logic comes later (Phase — Streak System).
// For now, this model only creates the initial row a new user needs,
// since `streaks.user_id` is UNIQUE and every user should have exactly one row.

const pool = require('../config/db');

const StreakModel = {
  async createForUser(userId) {
    await pool.query(
      'INSERT INTO streaks (user_id, current_streak, longest_streak, last_logged_date) VALUES (?, 0, 0, NULL)',
      [userId]
    );
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM streaks WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }
};

module.exports = StreakModel;
