// src/services/authService.js

const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const StreakModel = require('../models/streakModel');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistrationInput({ name, email, password }) {
  if (!name || !email || !password) {
    return 'All fields are required.';
  }
  if (name.trim().length === 0) {
    return 'Name cannot be empty or just spaces.';
  }
  if (name.trim().length > 100) {
    // Matches users.name VARCHAR(100) — catch this here with a friendly
    // message instead of letting MySQL throw a raw truncation error.
    return 'Name must be under 100 characters.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  if (email.trim().length > 150) {
    return 'Email must be under 150 characters.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null; // no error
}

const AuthService = {
  async register({ name, email, password }) {
    const validationError = validateRegistrationInput({ name, email, password });
    if (validationError) {
      const err = new Error(validationError);
      err.status = 400;
      throw err;
    }

    // Trim whitespace before storing — "  Sujal  " and "Sujal" should be
    // treated as the same input, not stored with stray spaces.
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existing = await UserModel.findByEmail(cleanEmail);
    if (existing) {
      const err = new Error('An account with this email already exists.');
      err.status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = await UserModel.create({ name: cleanName, email: cleanEmail, passwordHash });

    await StreakModel.createForUser(userId);

    return { id: userId, name: cleanName, email: cleanEmail };
  },

  async login({ email, password }) {
    if (!email || !password) {
      const err = new Error('Email and password are required.');
      err.status = 400;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await UserModel.findByEmail(cleanEmail);

    // Deliberately identical error for "no such user" and "wrong password" —
    // prevents an attacker from discovering which emails are registered.
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }

    return { id: user.id, name: user.name, email: user.email };
  }
};

module.exports = AuthService;
