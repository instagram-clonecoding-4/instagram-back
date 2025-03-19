const { StatusCodes } = require('http-status-codes');
const pool = require("../config/mariadb");

// 좋아요 추가
const addLike = async (req, res) => {
  const { post_id } = req.params;
  const { user_email } = req.body;

  if (!user_email) {
    return res.status(StatusCodes.BAD_REQUEST).end();
  }

  try {
    const connection = await pool.getConnection();

    // 중복 좋아요 방지
    const checkQuery = "SELECT * FROM likes WHERE post_id = ? AND user_email = ?";
    const [existingLike] = await connection.query(checkQuery, [post_id, user_email]);

    if (existingLike.length > 0) {
      connection.release();
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const query = "INSERT INTO likes (post_id, user_email) VALUES (?, ?)";
    await connection.query(query, [post_id, user_email]);
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
  const { user_email } = req.body;

  if (!user_email) {
    return res.status(StatusCodes.BAD_REQUEST).end();
  }

  try {
    const connection = await pool.getConnection();
    const query = "DELETE FROM likes WHERE post_id = ? AND user_email = ?";
    const [result] = await connection.query(query, [post_id, user_email]);
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
const getLikes = async (req, res) => {
  const { post_id } = req.params;

  try {
    const connection = await pool.getConnection();
    const query = 
    `SELECT l.user_email,
             (SELECT COUNT(*) FROM likes WHERE post_id = ?) AS like_count
      FROM likes l
      WHERE l.post_id = ?;`;
    const [rows] = await connection.query(query, [post_id, post_id]);
    connection.release();

    // 좋아요 개수 
    const like_count = rows.length > 0 ? rows[0].like_count : 0;

    // 좋아요 누른 사용자 ID 목록 
    const user_emails = rows.map(row => row.user_email);

    res.status(200).json({ like_count, user_emails });
  } catch (error) {
    console.error("좋아요 목록 조회 오류:", error);
    res.status(500).end();
  }
};

module.exports = {
  addLike,
  removeLike,
  getLikes
};
