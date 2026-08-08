// src/routes/revisionRoutes.js

const express = require('express');
const router = express.Router();
const RevisionController = require('../controllers/revisionController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', RevisionController.index);
router.post('/:id/complete', RevisionController.complete);

module.exports = router;
