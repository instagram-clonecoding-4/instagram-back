const express = require("express");
const router = express.Router();
const {
    addLike,
    removeLike,
    getLikes
} = require('../controllers/likeController');

router.post("/:post_id", addLike);          // 좋아요 추가 API
router.delete("/:post_id", removeLike);     // 좋아요 삭제 API
router.get("/:post_id", getLikes);          // post의 좋아요 조회 (좋아요를 누른 사용자 목록, 좋아요 갯수)

module.exports = router;