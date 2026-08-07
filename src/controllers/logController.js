// src/controllers/logController.js
// Receives requests, calls LogService, renders views / redirects.

const LogService = require('../services/logService');

const LogController = {
  // GET /logs — list all of this user's logs
  async index(req, res) {
    const logs = await LogService.getUserLogs(req.session.userId);
    res.render('logs/index', { logs });
  },

  // GET /logs/new — show the "add log" form
  showCreateForm(req, res) {
    res.render('logs/form', {
      mode: 'create',
      log: null,
      error: null
    });
  },

  // POST /logs — create a new log
  async create(req, res) {
    const { title, description, category } = req.body;
    try {
      await LogService.createLog(req.session.userId, { title, description, category });
      res.redirect('/logs');
    } catch (err) {
      res.status(err.status || 500).render('logs/form', {
        mode: 'create',
        log: { title, description, category },
        error: err.message
      });
    }
  },

  // GET /logs/:id/edit — show the edit form, pre-filled
  async showEditForm(req, res) {
    try {
      const log = await LogService.getLogForUser(req.params.id, req.session.userId);
      res.render('logs/form', { mode: 'edit', log, error: null });
    } catch (err) {
      res.status(err.status || 500).redirect('/logs');
    }
  },

  // POST /logs/:id — update an existing log
  async update(req, res) {
    const { title, description, category } = req.body;
    try {
      await LogService.updateLog(req.params.id, req.session.userId, { title, description, category });
      res.redirect('/logs');
    } catch (err) {
      res.status(err.status || 500).render('logs/form', {
        mode: 'edit',
        log: { id: req.params.id, title, description, category },
        error: err.message
      });
    }
  },

  // POST /logs/:id/delete
  async delete(req, res) {
    try {
      await LogService.deleteLog(req.params.id, req.session.userId);
    } catch (err) {
      // Even on error (e.g. not found / not owned), just return to the list —
      // nothing meaningful for the user to fix via a form here.
    }
    res.redirect('/logs');
  }
};

module.exports = LogController;
