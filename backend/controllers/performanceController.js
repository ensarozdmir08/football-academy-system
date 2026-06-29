const db = require('../db');

exports.getAllPerformance = (req, res) => {
    const sql = `
        SELECT 
            Performance.performance_id,
            Performance.player_id,
            Players.name AS player_name,
            Performance.date,
            Performance.attendance,
            Performance.goals,
            Performance.rating,
            Performance.feedback
        FROM Performance
        INNER JOIN Players ON Performance.player_id = Players.player_id
        ORDER BY Performance.date DESC
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

exports.addPerformance = (req, res) => {
    const { player_id, date, attendance, goals, rating, feedback } = req.body;

    if (!player_id || !date || attendance === undefined || goals === undefined || !rating) {
        return res.status(400).json({
            message: 'player_id, date, attendance, goals and rating are required'
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            message: 'Rating must be between 1 and 5'
        });
    }

    if (attendance < 0 || attendance > 100) {
        return res.status(400).json({
            message: 'Attendance must be between 0 and 100'
        });
    }

    const sql = `
        INSERT INTO Performance 
        (player_id, date, attendance, goals, rating, feedback)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [player_id, date, attendance, goals, rating, feedback], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        res.status(201).json({
            message: 'Performance record added successfully',
            performance_id: result.insertId
        });
    });
};

exports.getPerformanceByPlayer = (req, res) => {
    const { playerId } = req.params;

    const sql = `
        SELECT 
            performance_id,
            player_id,
            date,
            attendance,
            goals,
            rating,
            feedback
        FROM Performance
        WHERE player_id = ?
        ORDER BY date ASC
    `;

    db.query(sql, [playerId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        res.json(results);
    });
};

exports.updatePerformance = (req, res) => {
    const { id } = req.params;
    const { player_id, date, attendance, goals, rating, feedback } = req.body;

    if (!player_id || !date || attendance === undefined || goals === undefined || !rating) {
        return res.status(400).json({
            message: 'player_id, date, attendance, goals and rating are required'
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            message: 'Rating must be between 1 and 5'
        });
    }

    if (attendance < 0 || attendance > 100) {
        return res.status(400).json({
            message: 'Attendance must be between 0 and 100'
        });
    }

    const sql = `
        UPDATE Performance
        SET player_id = ?, date = ?, attendance = ?, goals = ?, rating = ?, feedback = ?
        WHERE performance_id = ?
    `;

    db.query(sql, [player_id, date, attendance, goals, rating, feedback, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Performance record not found'
            });
        }

        res.json({
            message: 'Performance record updated successfully'
        });
    });
};

exports.deletePerformance = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM Performance WHERE performance_id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Performance record not found'
            });
        }

        res.json({
            message: 'Performance record deleted successfully'
        });
    });
};