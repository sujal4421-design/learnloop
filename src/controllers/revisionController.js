// src/controllers/revisionController.js

const RevisionService = require('../services/revisionService');

const RevisionController = {
  // GET /revisions — "what to revise today" list
  async index(req, res) {
    res.redirect('/dashboard#revisions');
  },

  // POST /revisions/:id/complete — mark one revision as done
  async complete(req, res) {
    try {
      await RevisionService.markRevised(req.params.id, req.session.userId);
    } catch (err) {
      // Nothing actionable for the user here beyond returning to the list.
    }
    res.redirect('/dashboard#revisions');
  }
};

module.exports = RevisionController;
