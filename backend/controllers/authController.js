const db = require('../db');

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    const sql = 'SELECT * FROM Users WHERE username = ? AND password = ?';

    db.query(sql, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error',
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: 'Invalid username or password'
            });
        }

        const user = results[0];

        res.json({
            message: 'Login successful',
            user: {
                id: user.user_id,
                username: user.username,
                role: user.role
            }
        });
    });
};