//express 앱 설정 + 라우터 관리
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to Instagram Clone API');
});

module.exports = app;
