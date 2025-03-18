require('dotenv').config();
const express = require("express");
const followRoutes = require("./routes/followRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/follow", followRoutes);
app.use("/user", userRoutes);

app.listen(7777, () => console.log("🚀 Server is running on http://localhost:7777"));

module.exports = app; 