const express = require("express");
const router = express.Router();
const {
    addLike,
    removeLike,
    getLikeCount
} = require('../controllers/likeController');

router.post("/:post_id", addLike); // 좋아요 추가 API
router.delete("/:post_id", removeLike); // 좋아요 삭제 API
router.get("/:post_id", getLikeCount); // post의 좋아요 갯수 

module.exports = router;