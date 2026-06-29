const express = require('express');
const router = express.Router();

const coachController = require('../controllers/coachController');

router.get('/dashboard/stats', coachController.getCoachDashboardStats);

module.exports = router;