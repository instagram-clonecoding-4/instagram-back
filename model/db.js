const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'your-mariadb-host',
    user: 'your-mariadb-username',
    password: 'your-mariadb-password',
    database: 'your-mariadb-database'
});

db.connect((err) => {
    if (err) {
        console.error('DB 연결 실패:', err);
        process.exit(1);
    }
    console.log('Connected to MariaDB');
});

module.exports = db;
