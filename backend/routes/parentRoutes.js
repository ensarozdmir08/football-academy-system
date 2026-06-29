const express = require('express');
const router = express.Router();

const parentController = require('../controllers/parentController');

router.get('/:parentId/dashboard', parentController.getParentDashboard);

module.exports = router;