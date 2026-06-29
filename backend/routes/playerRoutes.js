const express = require('express');
const router = express.Router();

const playerController = require('../controllers/playerController');

router.get('/', playerController.getAllPlayers);
router.post('/', playerController.addPlayer);
router.get('/:id', playerController.getPlayerById);
router.put('/:id', playerController.updatePlayer);
router.delete('/:id', playerController.deletePlayer);

module.exports = router;