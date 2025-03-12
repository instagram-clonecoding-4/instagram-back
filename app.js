const express = require("express");
const followRoutes = require("./routes/followRoutes");

const app = express();
app.use(express.json());

app.use("/api/follow", followRoutes);

module.exports = app; 
