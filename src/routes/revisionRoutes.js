// src/routes/revisionRoutes.js

const express = require('express');
const router = express.Router();
const RevisionController = require('../controllers/revisionController');
const { requireAuth } = require('../middleware/authMiddleware');
const catchAsync = require('../utils/catchAsync');

router.use(requireAuth);

router.get('/', catchAsync(RevisionController.index));
router.post('/:id/complete', catchAsync(RevisionController.complete));

module.exports = router;
