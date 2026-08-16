// src/models/revisionModel.js
// Raw SQL only.

const pool = require('../config/db');

const RevisionModel = {
  // Insert several revision rows at once (used right after a log is created).
  async bulkCreate(logId, dates) {
    if (dates.length === 0) return;
    const values = dates.map(date => [logId, date]);
    await pool.query(
      'INSERT INTO revisions (log_id, scheduled_date) VALUES ?',
      [values]
    );
  },

  // Everything due today (or overdue and still pending) for a given user,
  // joined with the log so we can show the title/category.
  async findDueForUser(userId) {
    const [rows] = await pool.query(
      `SELECT r.id, r.scheduled_date, r.status, l.id AS log_id, l.title, l.category
       FROM revisions r
       JOIN logs l ON r.log_id = l.id
       WHERE l.user_id = ? AND r.status = 'pending' AND r.scheduled_date <= CURDATE()
       ORDER BY r.scheduled_date ASC`,
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT r.*, l.user_id
       FROM revisions r
       JOIN logs l ON r.log_id = l.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async markRevised(id) {
    await pool.query(
      `UPDATE revisions SET status = 'revised', revised_at = NOW() WHERE id = ?`,
      [id]
    );
  },

  // Used by the dashboard: counts of revised vs pending for a user.
  async countByStatusForUser(userId) {
    const [rows] = await pool.query(
      `SELECT r.status, COUNT(*) AS count
       FROM revisions r
       JOIN logs l ON r.log_id = l.id
       WHERE l.user_id = ?
       GROUP BY r.status`,
      [userId]
    );
    return rows;
  },

  // Used by the daily cron job — need every user who has something due,
  // not just one specific user's revisions.
  async findAllDueGroupedByUser() {
    const [rows] = await pool.query(
      `SELECT r.id, r.scheduled_date, l.title, l.category, u.id AS user_id, u.name, u.email
       FROM revisions r
       JOIN logs l ON r.log_id = l.id
       JOIN users u ON l.user_id = u.id
       WHERE r.status = 'pending' AND r.scheduled_date <= CURDATE()
       ORDER BY u.id`
    );

    // Group the flat rows into { userId: { user: {...}, revisions: [...] } }
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.user_id]) {
        grouped[row.user_id] = {
          user: { id: row.user_id, name: row.name, email: row.email },
          revisions: []
        };
      }
      grouped[row.user_id].revisions.push({
        id: row.id,
        title: row.title,
        category: row.category,
        scheduled_date: row.scheduled_date
      });
    }
    return Object.values(grouped);
  }
};

module.exports = RevisionModel;
