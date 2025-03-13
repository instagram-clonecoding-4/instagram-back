const { StatusCodes } = require('http-status-codes');
const pool = require("../config/mariadb");
const upload = require("../config/s3");

// 게시물 등록 API
const createPost = async (req, res) => {
    const { user_id, body } = req.body;
    if (!user_id) return res.status(StatusCodes.BAD_REQUEST).end();
  
    const files = req.files;
    if (!files || files.length === 0) return res.status(StatusCodes.BAD_REQUEST).end();
  
    let connection;  // 여기서 connection 변수를 선언
  
    try {
      connection = await pool.getConnection(); // connection 초기화
      await connection.beginTransaction();
  
      const [postResult] = await connection.query(
        "INSERT INTO posts (user_id, body) VALUES (?, ?)",
        [user_id, body || null]
      );
      const post_id = postResult.insertId;
  
      const contentInsertQuery = "INSERT INTO contents (post_id, content_type, url) VALUES ?";
      const contentValues = files.map((file) => [
        post_id,
        file.mimetype.startsWith("image") ? "image" : "video",
        file.location,
      ]);
      await connection.query(contentInsertQuery, [contentValues]);
  
      await connection.commit();
      res.status(StatusCodes.CREATED).json({ post_id, urls: files.map((f) => f.location) });
    } catch (error) {
      console.error("게시물 업로드 오류:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    } finally {
      if (connection) connection.release(); // connection이 존재하면 release 호출
    }
  };
  

// 게시물 수정 API
const updatePost = async (req, res) => {
    const { post_id } = req.params;
    const { user_id, body } = req.body;
    if (!user_id) return res.status(StatusCodes.BAD_REQUEST).end();
  
    const files = req.files;
    if (!files || files.length === 0) return res.status(StatusCodes.BAD_REQUEST).end();
  
    let connection;  // connection 변수 선언
  
    try {
      connection = await pool.getConnection();  // connection 초기화
      await connection.beginTransaction();
  
      if (body !== undefined) {
        await connection.query("UPDATE posts SET body = ? WHERE id = ?", [body, post_id]);
      }
  
      const contentInsertQuery = "INSERT INTO contents (post_id, content_type, url) VALUES ?";
      const contentValues = files.map((file) => [
        post_id,
        file.mimetype.startsWith("image") ? "image" : "video",
        file.location,
      ]);
      await connection.query(contentInsertQuery, [contentValues]);
  
      await connection.commit();
      res.status(StatusCodes.OK).json({ post_id, urls: files.map((f) => f.location) });
    } catch (error) {
      console.error("게시물 수정 오류:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    } finally {
      if (connection) connection.release();  // connection이 존재하면 release 호출
    }
  };
  

// 게시물 조회 API
const getPost = async (req, res) => {
  const { post_id } = req.params;

  try {
    const connection = await pool.getConnection();
    const [post] = await connection.query("SELECT * FROM posts WHERE id = ?", [post_id]);

    if (!post.length) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    const [contents] = await connection.query("SELECT * FROM contents WHERE post_id = ?", [post_id]);
    connection.release();

    res.status(StatusCodes.OK).json({
      post: {
        id: post[0].id,
        user_id: post[0].user_id,
        body: post[0].body,
        created_at: post[0].created_at,
        updated_at: post[0].updated_at,
      },
      contents: contents.map((content) => ({
        id: content.id,
        content_type: content.content_type,
        url: content.url,
      })),
    });
  } catch (error) {
    console.error("게시물 조회 오류:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

// 게시물 삭제 API
const deletePost = async (req, res) => {
    const { post_id } = req.params;
    
    let connection;  // connection 변수 선언
  
    try {
      connection = await pool.getConnection();  // connection 초기화
      await connection.beginTransaction();
  
      await connection.query("DELETE FROM contents WHERE post_id = ?", [post_id]);
      await connection.query("DELETE FROM posts WHERE id = ?", [post_id]);
  
      await connection.commit();
      res.status(StatusCodes.OK).end();
    } catch (error) {
      console.error("게시물 삭제 오류:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    } finally {
      if (connection) connection.release();  // connection이 존재하면 release 호출
    }
  };
  

module.exports = {
  createPost,
  updatePost,
  getPost,
  deletePost
};
