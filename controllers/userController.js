const jwt = require("jsonwebtoken");
const pool = require("../mariadb.js");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// 회원가입
exports.registerUser = async (req, res) => {
  let connection;
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
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

    // 회원 정보 저장
    await connection.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    res.status(201).json({ message: "회원가입 성공!" });

  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  } finally {
    if (connection) connection.release();
  }
};

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