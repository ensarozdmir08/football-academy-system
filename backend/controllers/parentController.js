const db = require('../db');

exports.getParentDashboard = (req, res) => {
    const { parentId } = req.params;

    const sql = `
        SELECT
            Players.player_id,
            Players.name,
            Players.age,
            Performance.date,
            Performance.attendance,
            Performance.goals,
            Performance.rating,
            Performance.feedback
        FROM Players
        LEFT JOIN Performance
            ON Players.player_id = Performance.player_id
        WHERE Players.parent_id = ?
        ORDER BY Performance.date DESC
    `;

    db.query(sql, [parentId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        res.json(results);
    });
};