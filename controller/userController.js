const db = require('../model/db');

exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).send('DB 조회 오류');
        } else {
            res.json(results);
        }
    });
};

exports.getUserById = (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            res.status(500).send('DB 조회 오류');
        } else {
            res.json(results[0]);
        }
    });
};

exports.createUser = (req, res) => {
    const { name, email } = req.body;
    db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err) => {
        if (err) {
            res.status(500).send('DB 저장 오류');
        } else {
            res.send('유저 생성 완료');
        }
    });
};
