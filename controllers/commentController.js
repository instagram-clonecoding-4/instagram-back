// controllers/commentController.js
const pool = require("../config/mariadb");

// 댓글 생성
const createComment = async (req, res) => {
  const { post_id } = req.params;
  const { user_id, body } = req.body;

  if (!user_id || !body) {
    return res.status(400).json({ message: "user_id와 body는 필수입니다." });
  }

  try {
    const connection = await pool.getConnection();
    const query = "INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, ?)";
    const [result] = await connection.query(query, [post_id, user_id, body]);

    res.status(201).json({ success: true, comment_id: result.insertId });
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    res.status(500).json({ success: false, message: "댓글 작성 실패" });
  }
};

// 댓글 삭제
const deleteComment = async (req, res) => {
  const { post_id, comment_id } = req.params;

  try {
    const connection = await pool.getConnection();
    const query = "DELETE FROM comments WHERE id = ? AND post_id = ?";
    const [result] = await connection.query(query, [comment_id, post_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    res.status(200).json({ success: true, message: "댓글이 삭제되었습니다." });
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    res.status(500).json({ success: false, message: "댓글 삭제 실패" });
  }
};

// 댓글 조회
const getComments = async (req, res) => {
  const { post_id } = req.params;

  try {
    const connection = await pool.getConnection();
    const query = "SELECT * FROM comments WHERE post_id = ?";
    const [comments] = await connection.query(query, [post_id]);

    if (comments.length === 0) {
      return res.status(404).json({ message: "댓글이 없습니다." });
    }

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("댓글 조회 오류:", error);
    res.status(500).json({ success: false, message: "댓글 조회 실패" });
  }
};

module.exports = {
  createComment,
  deleteComment,
  getComments
};
