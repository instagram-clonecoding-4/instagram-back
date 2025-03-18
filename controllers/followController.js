const pool = require('../mariadb.js');

// 팔로우 기능 (email 기반)
exports.followUser = async (req, res) => {
  try {
    const { email } = req.params; // 팔로우할 대상 이메일
    const currentUserEmail = req.user.email; // 현재 로그인한 사용자 이메일

    if (email === currentUserEmail) {
      return res.status(400).json({ message: "본인은 팔로우할 수 없습니다." });
    }

    const connection = await pool.getConnection();

    // 팔로우할 대상의 ID 조회
    const [targetUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    
    if (targetUser.length === 0) {
      connection.release();
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const [currentUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [currentUserEmail]
    );

    const targetUserId = targetUser[0].id;
    const currentUserId = currentUser[0].id;

    // 이미 팔로우 중인지 확인
    const [existingFollow] = await connection.query(
      "SELECT * FROM follow WHERE followerId = ? AND followingId = ?",
      [currentUserId, targetUserId]
    );

    if (existingFollow.length > 0) {
      connection.release();
      return res.status(400).json({ message: "이미 팔로우하고 있습니다." });
    }

    // 팔로우 추가
    await connection.query(
      "INSERT INTO follow (followerId, followingId) VALUES (?, ?)",
      [currentUserId, targetUserId]
    );

    connection.release();
    res.status(200).json({ message: "팔로우 완료!" });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "서버 오류", error });
  }
};

// 언팔로우 기능 (email 기반)
exports.unfollowUser = async (req, res) => {
  try {
    const { email } = req.params;
    const currentUserEmail = req.user.email;

    const connection = await pool.getConnection();

    // 언팔로우할 대상의 ID 조회
    const [targetUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (targetUser.length === 0) {
      connection.release();
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const [currentUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [currentUserEmail]
    );

    const targetUserId = targetUser[0].id;
    const currentUserId = currentUser[0].id;

    // 언팔로우할 관계가 있는지 확인
    const [follow] = await connection.query(
      "SELECT * FROM follow WHERE followerId = ? AND followingId = ?",
      [currentUserId, targetUserId]
    );

    if (follow.length === 0) {
      connection.release();
      return res.status(400).json({ message: "팔로우한 사용자가 아닙니다." });
    }

    // 언팔로우 삭제
    await connection.query(
      "DELETE FROM follow WHERE followerId = ? AND followingId = ?",
      [currentUserId, targetUserId]
    );

    connection.release();
    res.status(200).json({ message: "언팔로우 완료!" });

  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

// 팔로워 목록 조회 (email 기반)
exports.getFollowers = async (req, res) => {
  try {
    const { email } = req.params;

    const connection = await pool.getConnection();

    // 대상 사용자의 ID 조회
    const [targetUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (targetUser.length === 0) {
      connection.release();
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const targetUserId = targetUser[0].id;

    // 팔로워 목록 조회
    const [followers] = await connection.query(
      `SELECT users.id, users.username, users.email 
       FROM follow 
       JOIN users ON follow.followerId = users.id 
       WHERE follow.followingId = ?`,
      [targetUserId]
    );

    connection.release();
    res.status(200).json({ followers });

  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

// 팔로잉 목록 조회 (email 기반)
exports.getFollowing = async (req, res) => {
  try {
    const { email } = req.params;

    const connection = await pool.getConnection();

    // 대상 사용자의 ID 조회
    const [targetUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (targetUser.length === 0) {
      connection.release();
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const targetUserId = targetUser[0].id;

    // 팔로잉 목록 조회
    const [following] = await connection.query(
      `SELECT users.id, users.username, users.email 
       FROM follow 
       JOIN users ON follow.followingId = users.id 
       WHERE follow.followerId = ?`,
      [targetUserId]
    );

    connection.release();
    res.status(200).json({ following });

  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};
