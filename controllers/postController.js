const { StatusCodes } = require('http-status-codes');
const pool = require("../config/mariadb");

// 게시물 등록 API
const createPost = async (req, res) => {
  const { user_id, body } = req.body; 
  console.log("createPost - user_id:", user_id, "body:", body);
  
  if (!user_id) return res.status(StatusCodes.BAD_REQUEST).end();
  
  const files = req.files;
  if (!files || files.length === 0) {
    console.log("createPost - No files uploaded.");
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
  
  let connection;
  
  try {
    connection = await pool.getConnection(); 
    await connection.beginTransaction();
  
    const [postResult] = await connection.query(
      "INSERT INTO posts (user_id, body) VALUES (?, ?)",
      [user_id, body || null]
    );
    const post_id = postResult.insertId;
    console.log("createPost - Inserted post_id:", post_id);
  
    const contentValues = files.map((file) => [
      post_id,
      file.mimetype.startsWith("image") ? "image" : "video",
      file.location,
    ]);
    console.log("createPost - contentValues:", contentValues);

    await connection.query("INSERT INTO contents (post_id, content_type, url) VALUES ?", [contentValues]);
  
    await connection.commit();
    res.status(StatusCodes.CREATED).json({ post_id, urls: files.map((f) => f.location) });
  } catch (error) {
    console.error("createPost - Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  } finally {
    if (connection) connection.release();
  }
};

// 사용자별 게시물 조회
const getPostByUser = async (req, res) => {
  const { user_id } = req.query; 
  console.log("getPostByUser - user_id:", user_id);
  
  if (!user_id) {
    return res.status(StatusCodes.BAD_REQUEST).end(); 
  }
  
  try {
    const [posts] = await pool.query("SELECT * FROM posts WHERE user_id = ?", [user_id]);
    console.log("getPostByUser - posts:", posts);
  
    if (posts.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).end(); 
    }
    return res.status(StatusCodes.OK).json(posts); 
  } catch (error) {
    console.error("getPostByUser - Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

// 팔로우한 사용자들의 게시물 조회
const getFollowedPosts = async (req, res) => {
  const { user_id } = req.query; 
  console.log("getFollowedPosts - user_id:", user_id);

  if (!user_id) {
    return res.status(StatusCodes.BAD_REQUEST).end(); 
  }

  try {
    const [followedUsers] = await pool.query(`
      SELECT followingId FROM follow WHERE followerId = ?`, [user_id]);
    
    console.log("getFollowedPosts - followedUsers:", followedUsers);

    if (followedUsers.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).end(); 
    }

    const followedIds = followedUsers.map(user => user.followingId);
    console.log("getFollowedPosts - followedIds:", followedIds);

    const [posts] = await pool.query(
      `SELECT * FROM posts WHERE user_id IN (?)`, [followedIds]);

    console.log("getFollowedPosts - posts:", posts);

    if (posts.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).end();  
    }

    return res.status(StatusCodes.OK).json(posts); 
  } catch (err) {
    console.error("getFollowedPosts - Error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end(); 
  }
};

// 게시물 상세 조회 API
const getPost = async (req, res) => {
  const { post_id } = req.params;
  console.log("getPost - post_id:", post_id);

  try {
    const connection = await pool.getConnection();
    const [post] = await connection.query("SELECT * FROM posts WHERE id = ?", [post_id]);

    console.log("getPost - post:", post);

    if (!post.length) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    const [contents] = await connection.query("SELECT * FROM contents WHERE post_id = ?", [post_id]);
    console.log("getPost - contents:", contents);

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
    console.error("getPost - Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

// 게시물 수정 API
const updatePost = async (req, res) => {
  const { post_id } = req.params;
  const { user_id, body } = req.body;
  const files = req.files;

  console.log("updatePost - post_id:", post_id, "user_id:", user_id, "body:", body);
  
  if (!user_id) return res.status(StatusCodes.BAD_REQUEST).end();
  if (!files || files.length === 0) return res.status(StatusCodes.BAD_REQUEST).end();
  
  let connection;
  
  try {
    connection = await pool.getConnection();  
    await connection.beginTransaction();
  
    if (body !== undefined) {
      await connection.query("UPDATE posts SET body = ? WHERE id = ?", [body, post_id]);
    }
  
    const contentValues = files.map((file) => [
      post_id,
      file.mimetype.startsWith("image") ? "image" : "video",
      file.location,
    ]);
    console.log("updatePost - contentValues:", contentValues);

    await connection.query("INSERT INTO contents (post_id, content_type, url) VALUES ?", [contentValues]);
  
    await connection.commit();
    res.status(StatusCodes.OK).json({ post_id, urls: files.map((f) => f.location) });
  } catch (error) {
    console.error("updatePost - Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  } finally {
    if (connection) connection.release();  
  }
};

// 게시물 삭제 API
const deletePost = async (req, res) => {
  const { post_id } = req.params;
  console.log("deletePost - post_id:", post_id);
    
  let connection; 
  
  try {
    connection = await pool.getConnection();  
    await connection.beginTransaction();
  
    await connection.query("DELETE FROM contents WHERE post_id = ?", [post_id]);
    await connection.query("DELETE FROM posts WHERE id = ?", [post_id]);
  
    await connection.commit();
    res.status(StatusCodes.OK).end();
  } catch (error) {
    console.error("deletePost - Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  } finally {
    if (connection) connection.release();  
  }
};

module.exports = {
  createPost,
  updatePost,
  getPost,
  deletePost,
  getPostByUser,
  getFollowedPosts
};
