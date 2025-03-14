const express = require("express");
const router = express.Router();
const upload = require("../config/s3"); 
const { 
  createPost,
  updatePost,
  getPost,
  deletePost,
  getPostByUser
} = require('../controllers/postController');


router.post("/", upload.array("content", 10), createPost);// 게시물 등록 API
router.put("/:post_id", upload.array("content", 10), updatePost);// 게시물 수정 API
router.get("/:post_id", getPost);// 게시물 상세 조회 API
router.get("/", getPostByUser);//사용자 별 게시물 조회 API 
router.delete("/:post_id", deletePost);// 게시물 삭제 API

module.exports = router;