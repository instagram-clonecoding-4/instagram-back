const mariadb = require('mysql2');

// 연결 풀 생성
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dateStrings: true,
    connectionLimit: 10,  // 최대 연결 수
});

// `pool.getConnection()` 사용을 위해 `.promise()` 사용
module.exports = pool.promise();  // 연결 풀을 promise 기반으로 반환
