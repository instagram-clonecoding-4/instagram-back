const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());

const postRoutes = require('./routes/posts'); 
const commentRoutes = require("./routes/comments");
const likeRoutes = require("./routes/likes");

app.use("/posts", postRoutes); 
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);

app.listen(7777, () => console.log("🚀 Server is running on http://localhost:7777"));
