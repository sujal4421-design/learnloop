// src/routes/logRoutes.js
// Every route here requires the user to be logged in.

const express = require('express');
const router = express.Router();
const LogController = require('../controllers/logController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth); // applies to every route below in this file

router.get('/', LogController.index);
router.get('/new', LogController.showCreateForm);
router.post('/', LogController.create);
router.get('/:id/edit', LogController.showEditForm);
router.post('/:id', LogController.update);
router.post('/:id/delete', LogController.delete);

module.exports = router;
