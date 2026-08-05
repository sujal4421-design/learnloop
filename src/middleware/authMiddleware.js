// src/middleware/authMiddleware.js
// Runs BEFORE a route's controller. If the user isn't logged in,
// they're redirected to login instead of ever reaching the controller.

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next(); // user is logged in — proceed to the actual route handler
}

module.exports = { requireAuth };
