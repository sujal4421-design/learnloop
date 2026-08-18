// server.js
// Entry point — this is the file that actually starts LearnLoop.
// Run it with: npm run dev  (or) npm start

require('dotenv').config();
const express = require('express');
const path = require('path');

const pool = require('./src/config/db');
const sessionMiddleware = require('./src/config/session');
const { startDailyReminderJob } = require('./src/cron/dailyReminder');
const { notFoundHandler, globalErrorHandler } = require('./src/middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// ---- View engine ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- Core middleware ----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

// ---- Routes ----
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/logs', require('./src/routes/logRoutes'));
app.use('/revisions', require('./src/routes/revisionRoutes'));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('LearnLoop server is running. Visit /health to check the database connection.');
});

// ---- Error handling — MUST be registered after all real routes ----
app.use(notFoundHandler);   // catches any URL that didn't match a route
app.use(globalErrorHandler); // catches any error passed via next(err)

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`LearnLoop server running at http://localhost:${PORT}`);
  startDailyReminderJob();
});
