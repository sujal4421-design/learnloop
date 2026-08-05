// src/models/userModel.js
// The Model's ONLY job: talk to the database. No business logic here.

const pool = require('../config/db');

const UserModel = {
  // Find a user by email — used during login and during registration
  // (to check if the email is already taken).
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  // Find a user by id — used to load the logged-in user's data.
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Insert a new user. Expects passwordHash — already hashed by the Service,
  // the Model never sees or handles a plain-text password.
  async create({ name, email, passwordHash }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    return result.insertId;
  }
};

module.exports = UserModel;
