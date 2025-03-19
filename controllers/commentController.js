const { StatusCodes } = require('http-status-codes');
const pool = require("../config/mariadb");

// 댓글 생성
const createComment = async (req, res) => {
  const { post_id } = req.params;
  const { user_email, body } = req.body;

  if (!user_email || !body) {
    return res.status(StatusCodes.BAD_REQUEST).end();
  }

  try {
    const connection = await pool.getConnection();
    const query = "INSERT INTO comments (post_id, user_email, body) VALUES (?, ?, ?)";
    const [result] = await connection.query(query, [post_id, user_email, body]);
    connection.release();

    res.status(StatusCodes.CREATED).json({ comment_id: result.insertId });
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

// 댓글 삭제
const deleteComment = async (req, res) => {
  const { post_id, comment_id } = req.params;

  try {
    const connection = await pool.getConnection();
    const query = "DELETE FROM comments WHERE id = ? AND post_id = ?";
    const [result] = await connection.query(query, [comment_id, post_id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    res.status(StatusCodes.OK).end();
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

// 댓글 조회
const getComments = async (req, res) => {
  const { post_id } = req.params;

  try {
    const connection = await pool.getConnection();
    const query = "SELECT * FROM comments WHERE post_id = ?";
    const [comments] = await connection.query(query, [post_id]);
    connection.release();

    if (comments.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    res.status(StatusCodes.OK).json({ comments });
  } catch (error) {
    console.error("댓글 조회 오류:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

module.exports = {
  createComment,
  deleteComment,
  getComments
};