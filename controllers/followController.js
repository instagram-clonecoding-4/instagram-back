const pool = require('../db.js');

// 팔로우 기능
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;  // 팔로우할 대상 ID
    const currentUserId = req.user.id; // 현재 로그인한 사용자 ID

    if (parseInt(userId) === currentUserId) {
      return res.status(400).json({ message: "본인은 팔로우할 수 없습니다." });
    }

    const connection = await pool.getConnection();

    // 이미 팔로우중인인지 확인
    const [existingFollow] = await connection.query(
      "SELECT * FROM Follows WHERE followerId = ? AND followingId = ?",
      [currentUserId, userId]
    );

    if (existingFollow.length > 0) {
      connection.release();
      return res.status(400).json({ message: "이미 팔로우하고 있습니다." });
    }

    // 팔로우 추가
    await connection.query(
      "INSERT INTO Follows (followerId, followingId) VALUES (?, ?)",
      [currentUserId, userId]
    );

    connection.release();
    res.status(200).json({ message: "팔로우 완료!" });

  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

// 언팔로우 기능
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const connection = await pool.getConnection();

    // 언팔로우할 관계가 있는지 확인
    const [follow] = await connection.query(
      "SELECT * FROM Follows WHERE followerId = ? AND followingId = ?",
      [currentUserId, userId]
    );

    if (follow.length === 0) {
      connection.release();
      return res.status(400).json({ message: "팔로우한 사용자가 아닙니다." });
    }

    // 언팔로우 삭제
    await connection.query(
      "DELETE FROM Follows WHERE followerId = ? AND followingId = ?",
      [currentUserId, userId]
    );

    connection.release();
    res.status(200).json({ message: "언팔로우 완료!" });

  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

// 팔로워 목록 조회 
exports.getUserFollowers = async (req, res) => {
    try {
      const { targetUserId } = req.params;
  
      const connection = await pool.getConnection();
  
      const [followers] = await connection.query(
        `SELECT Users.id, Users.username, Users.email 
         FROM Follows 
         JOIN Users ON Follows.followerId = Users.id 
         WHERE Follows.followingId = ?`,
        [targetUserId]
      );
  
      connection.release();
      res.status(200).json({ followers });
  
    } catch (error) {
      res.status(500).json({ message: "서버 오류", error });
    }
  };
  
    // 팔로잉 목록 조회
  exports.getUserFollowing = async (req, res) => {
    try {
      const { targetUserId } = req.params;
  
      const connection = await pool.getConnection();
  
      const [following] = await connection.query(
        `SELECT Users.id, Users.username, Users.email 
         FROM Follows 
         JOIN Users ON Follows.followingId = Users.id 
         WHERE Follows.followerId = ?`,
        [targetUserId]
      );
  
      connection.release();
      res.status(200).json({ following });
  
    } catch (error) {
      res.status(500).json({ message: "서버 오류", error });
    }
  };
