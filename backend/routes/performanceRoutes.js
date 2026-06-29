const express = require('express');
const router = express.Router();

const performanceController = require('../controllers/performanceController');

router.get('/', performanceController.getAllPerformance);
router.post('/', performanceController.addPerformance);
router.get('/player/:playerId', performanceController.getPerformanceByPlayer);
router.put('/:id', performanceController.updatePerformance);
router.delete('/:id', performanceController.deletePerformance);

module.exports = router;