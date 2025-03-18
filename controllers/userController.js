const jwt = require("jsonwebtoken");
const pool = require("../mariadb.js");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// 회원가입
exports.registerUser = async (req, res) => {
  let connection;
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({ message: "모든 필드를 입력하세요." });
    }

    connection = await pool.getConnection();

    // 이메일 중복 확인
    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "이미 가입된 이메일입니다." });
    }

    await connection.query(
      "INSERT INTO users (email, password, name, username) VALUES (?, ?, ?, ?)",
      [email, password, name, username]
    );

    res.status(201).json({ message: "회원가입 성공!" });

  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
    console.error(error);
  } finally {
    if (connection) connection.release();
  }
};


// 로그인
exports.loginUser = async (req, res) => {
    let connection;
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: "이메일과 비밀번호를 입력하세요." });
      }
  
      connection = await pool.getConnection();
  
      // 이메일/비밀번호 확인
      const [user] = await connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
  
      if (user.length === 0 || user[0].password !== password) {
        return res.status(400).json({ message: "이메일이나 비밀번호가 잘못되었습니다." });
      }
  
      // JWT 발급
      const token = jwt.sign({ id: user[0].id, email: user[0].email }, JWT_SECRET, {
        expiresIn: "7d",
      });
  
      res.status(200).json({ message: "로그인 성공!", token, id: user[0].id });
  
    } catch (error) {
      res.status(500).json({ message: "서버 오류", error });
      console.error(error);
    } finally {
      if (connection) connection.release();
    }
  };

// 특정 회원 정보 조회
exports.getUserInfo = async (req, res) => {
let connection;
try {
    const { email } = req.params; 

    connection = await pool.getConnection();


    const [user] = await connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
    );

    if (user.length === 0) {
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json(user[0]);

} catch (error) {
    res.status(500).json({ message: "서버 오류", error });
    console.error(error);
} finally {
    if (connection) connection.release();
}
};
