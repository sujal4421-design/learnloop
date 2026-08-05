// src/services/authService.js
// The Service's job: business logic. The Controller calls THIS,
// never the Model directly.

const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const StreakModel = require('../models/streakModel');

const SALT_ROUNDS = 10; // bcrypt's "cost factor" — higher = slower to compute = more secure, but slower logins. 10 is a solid default.

const AuthService = {
  async register({ name, email, password }) {
    // Business rule: no two users can share an email.
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      const err = new Error('An account with this email already exists.');
      err.status = 409; // HTTP 409 = Conflict
      throw err;
    }

    // Hash the password BEFORE it ever touches the database.
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userId = await UserModel.create({ name, email, passwordHash });

    // Every user needs exactly one streaks row (Phase — Streak System depends on this existing).
    await StreakModel.createForUser(userId);

    return { id: userId, name, email };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.status = 401; // HTTP 401 = Unauthorized
      throw err;
    }

    // Compare the submitted password against the stored hash.
    // bcrypt.compare hashes the input internally and checks if it matches —
    // we never decrypt the stored hash, because that's not possible.
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }

    // Deliberately vague error message on both "no such email" and "wrong password" —
    // if we said "email not found" vs "wrong password" separately, an attacker could
    // use that to discover which emails are registered. This is a real security pattern,
    // not an accident.

    return { id: user.id, name: user.name, email: user.email };
  }
};

module.exports = AuthService;
