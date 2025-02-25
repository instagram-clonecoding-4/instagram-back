const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db");
const userRoutes = require("./routes/users");

// dotenv.config();
// connectDB();

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

module.exports = app;  // 서버 실행을 위한 app 객체 export
