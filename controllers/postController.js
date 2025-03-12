const pool = require("../config/mariadb");
const upload = require("../config/s3");

// 게시물 등록 API
const createPost = async (req, res) => {
  const { user_id, body } = req.body;
  if (!user_id) return res.status(400).json({ message: "user_id를 입력해주세요." });

  const files = req.files;
  if (!files || files.length === 0) return res.status(400).json({ message: "이미지 또는 동영상이 하나 이상 필요합니다." });

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // posts 테이블에 게시물 저장 (body는 없을 수 있음)
    const [postResult] = await connection.query(
      "INSERT INTO posts (user_id, body) VALUES (?, ?)",
      [user_id, body || null]
    );
    const post_id = postResult.insertId;

    // contents 테이블에 S3 URL 저장
    const contentInsertQuery = "INSERT INTO contents (post_id, content_type, url) VALUES ?";
    const contentValues = files.map((file) => [
      post_id,
      file.mimetype.startsWith("image") ? "image" : "video",
      file.location,
    ]);
    await connection.query(contentInsertQuery, [contentValues]);

    await connection.commit();
    res.status(201).json({ success: true, post_id, urls: files.map((f) => f.location) });
  } catch (error) {
    console.error("게시물 업로드 오류:", error);
    res.status(500).json({ success: false, message: "게시물 등록 실패" });
  } finally {
    if (connection) {
      connection.release(); 
    }
  }
};

// 게시물 수정 API
const updatePost = async (req, res) => {
  const { post_id } = req.params;
  const { user_id, body } = req.body;
  if (!user_id) return res.status(400).json({ message: "user_id는 필수입니다." });

  const files = req.files;
  if (!files || files.length === 0) return res.status(400).json({ message: "이미지 또는 동영상을 업로드하세요." });

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // 게시물의 기존 `body`를 수정 (body는 선택 사항)
    if (body !== undefined) {
      await connection.query("UPDATE posts SET body = ? WHERE id = ?", [body, post_id]);
    }

    // 기존 contents를 삭제하지 않고 새로 추가할 수 있음
    const contentInsertQuery = "INSERT INTO contents (post_id, content_type, url) VALUES ?";
    const contentValues = files.map((file) => [
      post_id,
      file.mimetype.startsWith("image") ? "image" : "video",
      file.location,
    ]);
    await connection.query(contentInsertQuery, [contentValues]);

    await connection.commit();
    res.status(200).json({ success: true, post_id, urls: files.map((f) => f.location) });
  } catch (error) {
    console.error("게시물 수정 오류:", error);
    res.status(500).json({ success: false, message: "게시물 수정 실패" });
  } finally {
    connection.release();
  }
};

// 게시물 조회 API
const getPost = async (req, res) => {
  const { post_id } = req.params; // URL에서 post_id를 받아옴

  try {
    const connection = await pool.getConnection();

    // 게시물 정보 조회
    const [post] = await connection.query(
      "SELECT * FROM posts WHERE id = ?",
      [post_id]
    );

    if (!post || post.length === 0) {
      return res.status(404).json({ message: "게시물이 존재하지 않습니다." });
    }

    // 해당 게시물에 관련된 콘텐츠(이미지/동영상) 정보 조회
    const [contents] = await connection.query(
      "SELECT * FROM contents WHERE post_id = ?",
      [post_id]
    );

    if (!contents || contents.length === 0) {
      return res.status(404).json({ message: "이 게시물에 첨부된 콘텐츠가 없습니다." });
    }

    // 게시물 정보와 콘텐츠 정보를 합쳐서 반환
    res.status(200).json({
      success: true,
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
    res.status(500).json({ success: false, message: "게시물 조회 실패" });
  } finally {
    connection.release();
  }
};

// 게시물 삭제 API
const deletePost = async (req, res) => {
  const { post_id } = req.params; 

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction(); 

    // 해당 게시물에 연결된 콘텐츠 삭제
    const deleteContentQuery = "DELETE FROM contents WHERE post_id = ?";
    await connection.query(deleteContentQuery, [post_id]);

    // 게시물 자체 삭제 (선택사항)
    const deletePostQuery = "DELETE FROM posts WHERE id = ?";
    await connection.query(deletePostQuery, [post_id]);

    await connection.commit();  

    res.status(200).json({
      success: true,
      message: "게시물과 연결된 콘텐츠가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("게시물 삭제 오류:", error);
    res.status(500).json({ success: false, message: "게시물 및 콘텐츠 삭제 실패" });
  } finally {
    connection.release();  
  }
};

module.exports = {
  createPost,
  updatePost,
  getPost,
  deletePost
};
