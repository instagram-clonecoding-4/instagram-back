require('dotenv').config();
const express = require("express");
const followRoutes = require("./routes/followRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const HOST = "0.0.0.0";
const PORT = 7777;
app.listen(PORT, HOST, () => {
    console.log(`🚀 서버 실행 중: http://${HOST}:${PORT}`);
  });
app.use("/follow", followRoutes);
app.use("/user", userRoutes);

module.exports = app; 
