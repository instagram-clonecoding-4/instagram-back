const express = require("express");
const router = express.Router();
const upload = require("../config/s3"); 
const { 
  createPost,
  updatePost,
  getPost,
  deletePost,
} = require('../controllers/postController');

// 게시물 등록 API
router.post("/", upload.array("content", 10), createPost);

// 게시물 수정 API
router.put("/:post_id", upload.array("content", 10), updatePost);

// 게시물 조회 API
router.get("/:post_id", getPost);

// 게시물 삭제 API
router.delete("/:post_id", deletePost);

module.exports = router;
