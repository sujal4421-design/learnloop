// src/config/session.js
// Configures express-session to store sessions in our MySQL database
// (the `sessions` table from schema.sql) instead of in server memory.
// This means sessions survive a server restart, and work correctly
// even if we later run multiple server instances.

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./db');

const sessionStore = new MySQLStore({}, pool);

const sessionMiddleware = session({
  key: 'learnloop_session',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,            // don't save session if nothing changed
  saveUninitialized: false, // don't create a session until something is stored
  cookie: {
    httpOnly: true,          // JS in the browser can't read this cookie (XSS protection)
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
});

module.exports = sessionMiddleware;
