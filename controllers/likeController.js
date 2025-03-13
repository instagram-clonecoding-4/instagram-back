const { StatusCodes } = require('http-status-codes');
const pool = require("../config/mariadb");

// 좋아요 추가
const addLike = async (req, res) => {
  const { post_id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(StatusCodes.BAD_REQUEST).end();
  }

  try {
    const connection = await pool.getConnection();

    // 중복 좋아요 방지
    const checkQuery = "SELECT * FROM likes WHERE post_id = ? AND user_id = ?";
    const [existingLike] = await connection.query(checkQuery, [post_id, user_id]);

    if (existingLike.length > 0) {
      connection.release();
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const query = "INSERT INTO likes (post_id, user_id) VALUES (?, ?)";
    await connection.query(query, [post_id, user_id]);
    connection.release();

    res.status(StatusCodes.CREATED).end();
  } catch (error) {
    console.error("좋아요 추가 오류:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

// 좋아요 취소
const removeLike = async (req, res) => {
  const { post_id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(StatusCodes.BAD_REQUEST).end();
  }

  try {
    const connection = await pool.getConnection();
    const query = "DELETE FROM likes WHERE post_id = ? AND user_id = ?";
    const [result] = await connection.query(query, [post_id, user_id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    res.status(StatusCodes.OK).end();
  } catch (error) {
    console.error("좋아요 취소 오류:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

// 게시물 좋아요 개수 조회
const getLikeCount = async (req, res) => {
  const { post_id } = req.params;

  try {
    const connection = await pool.getConnection();
    const query = "SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?";
    const [rows] = await connection.query(query, [post_id]);
    connection.release();

    res.status(StatusCodes.OK).json({ like_count: rows[0].like_count });
  } catch (error) {
    console.error("좋아요 개수 조회 오류:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

module.exports = {
  addLike,
  removeLike,
  getLikeCount
};
