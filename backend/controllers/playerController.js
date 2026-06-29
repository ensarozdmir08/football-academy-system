const db = require('../db');

exports.getAllPlayers = (req, res) => {
    const sql = `
        SELECT 
            Players.player_id,
            Players.name,
            Players.age,
            Players.parent_id,
            Users.username AS parent_username
        FROM Players
        LEFT JOIN Users ON Players.parent_id = Users.user_id
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        res.json(results);
    });
};

exports.addPlayer = (req, res) => {
    const { name, age, parent_id } = req.body;

    if (!name || !age || !parent_id) {
        return res.status(400).json({
            message: 'Player name, age and parent_id are required'
        });
    }

    const sql = 'INSERT INTO Players (name, age, parent_id) VALUES (?, ?, ?)';

    db.query(sql, [name, age, parent_id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        res.status(201).json({
            message: 'Player added successfully',
            player_id: result.insertId
        });
    });
};

exports.getPlayerById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            Players.player_id,
            Players.name,
            Players.age,
            Players.parent_id,
            Users.username AS parent_username
        FROM Players
        LEFT JOIN Users ON Players.parent_id = Users.user_id
        WHERE Players.player_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Player not found'
            });
        }

        res.json(results[0]);
    });
};

exports.updatePlayer = (req, res) => {
    const { id } = req.params;
    const { name, age, parent_id } = req.body;

    if (!name || !age || !parent_id) {
        return res.status(400).json({
            message: 'Player name, age and parent_id are required'
        });
    }

    const sql = 'UPDATE Players SET name = ?, age = ?, parent_id = ? WHERE player_id = ?';

    db.query(sql, [name, age, parent_id, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Player not found'
            });
        }

        res.json({
            message: 'Player updated successfully'
        });
    });
};

exports.deletePlayer = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM Players WHERE player_id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Player not found'
            });
        }

        res.json({
            message: 'Player deleted successfully'
        });
    });
};