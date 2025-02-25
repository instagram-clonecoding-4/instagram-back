// 서버 실행 + DB 연결 고리
const mysql = require('mysql2');
const app = require('./app'); // app.js 불러오기

// MariaDB connection
const db = mysql.createConnection({
    host: 'your-mariadb-host',
    user: 'your-mariadb-username',
    password: 'your-mariadb-password',
    database: 'your-mariadb-database'
});

db.connect((err) => {
    if (!err) {
        console.log('DB 연결 성공했습니다.');
    } else {
        console.error('DB 연결 실패되었습니다:', err);
        process.exit(1); // DB 연결 실패 시 서버 종료
    }
});
// Start server
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
