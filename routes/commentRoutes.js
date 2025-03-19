const express = require("express");
const router = express.Router();
const { 
    createComment,
    deleteComment,
    getComments 
} = require("../controllers/commentController");

router.post("/:post_id", createComment);                //댓글 작성 API
router.delete("/:post_id/:comment_id", deleteComment);  //댓글 삭제 API 
router.get("/:post_id", getComments);                   //댓글 조회 API

module.exports = router;