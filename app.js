require('dotenv').config();
const express = require("express");
const followRoutes = require("./routes/followRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

app.listen(7777)

app.use("/follow", followRoutes);
app.use("/user", userRoutes);

module.exports = app; 
