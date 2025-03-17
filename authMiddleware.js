const jwt = require("jsonwebtoken");
require("dotenv").config(); // 환경 변수 로드

const JWT_SECRET = process.env.JWT_SECRET; // 환경 변수 적용

exports.authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다. 인증이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};
