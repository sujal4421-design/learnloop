// src/middleware/rateLimiter.js
// Prevents brute-force attacks on login and register by capping the number
// of requests a single IP can make in a rolling 15-minute window.

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute rolling window
  max: 10,                   // max 10 attempts per window per IP
  standardHeaders: true,     // include RateLimit-* headers in responses
  legacyHeaders: false,      // disable the old X-RateLimit-* headers

  // Return a plain-language message instead of the default JSON response,
  // so it renders nicely inside our EJS error views.
  handler(req, res) {
    const isRegister = req.path.includes('register');
    const view = isRegister ? 'auth/register' : 'auth/login';
    res.status(429).render(view, {
      error: 'Too many attempts. Please wait 15 minutes before trying again.'
    });
  }
});

module.exports = { authLimiter };
