// src/config/db.js
// Central MySQL connection pool.
// A "pool" keeps several reusable DB connections open, instead of
// opening/closing a new one for every query — much faster under load.

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Return DATE columns as plain 'YYYY-MM-DD' strings instead of JS Date
  // objects. Without this, mysql2 wraps DATE values in a Date object
  // anchored to the server's local timezone, and later converting that
  // through toISOString() (which is UTC) can silently shift the date by
  // a day for timezones ahead of UTC. Plain strings sidestep the whole
  // problem — there's no timezone to misinterpret.
  dateStrings: ['DATE']
});

module.exports = pool;
