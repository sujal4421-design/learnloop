// src/routes/logRoutes.js

const express = require('express');
const router = express.Router();
const LogController = require('../controllers/logController');
const { requireAuth } = require('../middleware/authMiddleware');
const catchAsync = require('../utils/catchAsync');

router.use(requireAuth);

router.get('/', catchAsync(LogController.index));
router.get('/new', LogController.showCreateForm);
router.post('/', catchAsync(LogController.create));
router.get('/:id/edit', catchAsync(LogController.showEditForm));
router.post('/:id', catchAsync(LogController.update));
router.post('/:id/delete', catchAsync(LogController.delete));

module.exports = router;
