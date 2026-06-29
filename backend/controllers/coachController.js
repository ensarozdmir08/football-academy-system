const db = require('../db');

exports.getCoachDashboardStats = (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM Players) AS total_players,
            (SELECT IFNULL(ROUND(AVG(rating), 1), 0) FROM Performance) AS average_rating,
            (SELECT IFNULL(ROUND(AVG(attendance), 1), 0) FROM Performance) AS average_attendance,
            (SELECT IFNULL(SUM(goals), 0) FROM Performance) AS total_goals
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        res.json(results[0]);
    });
};