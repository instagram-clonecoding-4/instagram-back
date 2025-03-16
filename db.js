// Get the client
const mysql = require('mysql2');

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'Instagram',
});

// A simple SELECT query
connection.query(
  'SELECT * FROM `users`',
  function (err, results, fields) {
    var {id, email, name} = results[0]; // json array 비구조화
    console.log(id);
    console.log(email);
    console.log(name);
  }
);