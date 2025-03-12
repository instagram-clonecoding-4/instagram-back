const express = require("express");
const router = express.Router();
const { 
    createComment,
    deleteComment,
    getComments 
} = require("../controllers/commentController");

router.post("/:post_id", createComment);
router.delete("/:post_id/:comment_id", deleteComment);
router.get("/:post_id", getComments);

module.exports = router;