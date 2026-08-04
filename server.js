// server.js
// Entry point — this is the file that actually starts LearnLoop.
// Run it with: npm run dev  (or) npm start

require('dotenv').config();
const express = require('express');
const path = require('path');

const pool = require('./src/config/db');
const sessionMiddleware = require('./src/config/session');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- View engine ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- Core middleware ----
app.use(express.urlencoded({ extended: true })); // parse HTML form submissions
app.use(express.json());                          // parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // serve CSS/JS/images
app.use(sessionMiddleware);

// ---- Routes ----
// Route files will be added here as they're built:
// app.use('/auth', require('./src/routes/authRoutes'));
// app.use('/logs', require('./src/routes/logRoutes'));
// app.use('/revisions', require('./src/routes/revisionRoutes'));
// app.use('/dashboard', require('./src/routes/dashboardRoutes'));

// Temporary health-check route — confirms the server + DB are alive.
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

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`LearnLoop server running at http://localhost:${PORT}`);
});
