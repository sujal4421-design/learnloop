// src/models/logModel.js
// Raw SQL only. No ownership checks, no business logic — that's the Service's job.

const pool = require('../config/db');

const LogModel = {
  async create({ userId, title, description, category }) {
    const [result] = await pool.query(
      `INSERT INTO logs (user_id, title, description, category, date_learned)
       VALUES (?, ?, ?, ?, CURDATE())`,
      [userId, title, description, category]
    );
    return result.insertId;
  },

  async findAllByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM logs WHERE user_id = ? ORDER BY date_learned DESC, created_at DESC',
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM logs WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async update(id, { title, description, category }) {
    await pool.query(
      'UPDATE logs SET title = ?, description = ?, category = ? WHERE id = ?',
      [title, description, category, id]
    );
  },

  async delete(id) {
    // revisions for this log are removed automatically — ON DELETE CASCADE (schema.sql)
    await pool.query('DELETE FROM logs WHERE id = ?', [id]);
  },

  async countTotalForUser(userId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM logs WHERE user_id = ?',
      [userId]
    );
    return rows[0].total;
  },

  async countByCategoryForUser(userId) {
    const [rows] = await pool.query(
      `SELECT category, COUNT(*) AS count
       FROM logs
       WHERE user_id = ?
       GROUP BY category
       ORDER BY count DESC`,
      [userId]
    );
    return rows;
  }
};

module.exports = LogModel;
