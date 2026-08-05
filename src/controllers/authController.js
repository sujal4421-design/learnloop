// src/controllers/authController.js
// The Controller's job: receive the request, call the Service, send the response.
// It does NOT contain business logic — that all lives in AuthService.

const AuthService = require('../services/authService');

const AuthController = {
  // GET /auth/register — show the registration form
  showRegisterForm(req, res) {
    res.render('auth/register', { error: null });
  },

  // POST /auth/register — handle form submission
  async register(req, res) {
    const { name, email, password } = req.body;

    // Basic input validation — the Controller's responsibility (not business logic,
    // just "is this request well-formed at all").
    if (!name || !email || !password) {
      return res.render('auth/register', { error: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.render('auth/register', { error: 'Password must be at least 6 characters.' });
    }

    try {
      const user = await AuthService.register({ name, email, password });

      // Log the user in immediately after registering — store their id in the session.
      req.session.userId = user.id;
      req.session.userName = user.name;

      res.redirect('/dashboard');
    } catch (err) {
      res.status(err.status || 500).render('auth/register', { error: err.message });
    }
  },

  // GET /auth/login — show the login form
  showLoginForm(req, res) {
    res.render('auth/login', { error: null });
  },

  // POST /auth/login — handle form submission
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('auth/login', { error: 'Email and password are required.' });
    }

    try {
      const user = await AuthService.login({ email, password });

      req.session.userId = user.id;
      req.session.userName = user.name;

      res.redirect('/dashboard');
    } catch (err) {
      res.status(err.status || 500).render('auth/login', { error: err.message });
    }
  },

  // POST /auth/logout
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.clearCookie('learnloop_session');
      res.redirect('/auth/login');
    });
  }
};

module.exports = AuthController;
