import conn from "../../config/db.js";
import sqlString from "sqlstring";

const queryAsync = async (query, values) => {
  return await new Promise((resolve, reject) => {
    conn.query(query, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export class PostController {
  static async getPosts(req, res) {
    let { tagId, keyword, status, orderBy, sortBy } = req.query;
    let offset = Number(req.query.offset);
    let limit = Number(req.query.limit);
    offset = offset * limit;

    let whereQuery = " WHERE 1 = 1 ";

    if (tagId) {
      whereQuery += ` AND tagId = ${tagId} `;
    }

    if (keyword) {
      whereQuery += ` AND title LIKE '%${keyword}%' `;
    }

    if (req.user.role == "user") {
      whereQuery += ` AND status = 'published' `;
    } else if (req.user.role == "admin") {
      if (status) {
        whereQuery += ` AND status = '${status}' `;
      } else {
        whereQuery += ` AND status != 'deleted' `;
      }
    }

    let orderByQuery = "";

    if (orderBy && sortBy) {
      orderByQuery = ` ORDER BY ${orderBy} ${sortBy} `;
    } else if (orderBy) {
      orderByQuery = ` ORDER BY ${orderBy} ASC `;
    } else if (sortBy) {
      orderByQuery = ` ORDER BY createdAt ${sortBy} `;
    } else {
      orderByQuery = ` ORDER BY createdAt ASC `;
    }

    let query = sqlString.format(`SELECT * ,
        (SELECT tagName FROM Tag WHERE tagId = Post.tagId) AS tagName,
        (SELECT COUNT(*) FROM PostLike WHERE postId = Post.postId AND status = 'liked') AS totalLikes
        ${
          req.user.role == "user"
            ? `, (SELECT COUNT(*) FROM PostLike WHERE postId = Post.postId AND userId = ${req.user.userId} AND status = 'liked' ORDER BY postLikeId DESC LIMIT 1) AS isLiked`
            : ``
        }
      FROM Post ${whereQuery} ${orderByQuery}`);

    if (!isNaN(offset) && !isNaN(limit) && offset >= 0 && limit >= 0) {
      query += sqlString.format(` LIMIT ?, ?;`, [offset, limit]);
    } else {
      query += ";";
    }

    query += sqlString.format(
      `SELECT COUNT(*) AS totalRecords FROM Post ${whereQuery}`
    );

    conn.query(query, (err, results) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      let posts = results[0];

      let pageMeta = {
        totalRecords: results[1][0].totalRecords,
      };

      if (!isNaN(offset) && !isNaN(limit) && offset >= 0 && limit >= 0) {
        pageMeta.noOfPages = Math.ceil(pageMeta.totalRecords / limit);
      } else {
        pageMeta.noOfPages = 1;
      }

      return res.json({
        success: true,
        posts,
        pageMeta,
      });
    });
  }

  static async getPost(req, res) {
    let postId = req.params.postId;

    let query = sqlString.format(
      `SELECT * ,
        (SELECT tagName FROM Tag WHERE tagId = Post.tagId) AS tagName,
      (SELECT COUNT(*) FROM PostLike WHERE postId = Post.postId AND status = 'liked') AS totalLikes
      ${
        req.user.role == "user"
          ? `, (SELECT COUNT(*) FROM PostLike WHERE postId = Post.postId AND userId = ${req.user.userId} AND status = 'liked' ORDER BY postLikeId DESC LIMIT 1) AS isLiked`
          : ``
      }
    FROM Post WHERE postId = ?;`,
      [postId]
    );

    conn.query(query, (err, results) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      let post = results[0];

      return res.json({
        success: true,
        post,
      });
    });
  }

  static async likePost(req, res) {
    let userId = req.user.userId;
    let postId = req.params.postId;

    let query = sqlString.format(
      `SELECT * FROM PostLike WHERE postId = ? AND userId = ?;`,
      [postId, userId]
    );

    conn.query(query, (err, results) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      let action = "";

      if (results.length > 0) {
        let postLikeId = results[0].postLikeId;
        let status = results[0].status;

        if (status == "liked") {
          query = sqlString.format(
            `UPDATE PostLike SET status = 'unliked' WHERE postLikeId = ?;`,
            [postLikeId]
          );

          action = "unliked";
        } else {
          query = sqlString.format(
            `UPDATE PostLike SET status = 'liked' WHERE postLikeId = ?;`,
            [postLikeId]
          );

          action = "liked";
        }
      } else {
        query = sqlString.format(`INSERT INTO PostLike SET ?;`, [
          {
            postId,
            userId,
            status: "liked",
          },
        ]);

        action = "liked";
      }

      conn.query(query, (err, results) => {
        if (err) {
          console.log(err);

          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        return res.json({
          success: true,
          message: "Post " + action,
        });
      });
    });
  }

  static async createPost(req, res) {
    let { tagId, title, description, banner } = req.body;

    if (!tagId || !title || !description || !banner) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    let query = sqlString.format(`INSERT INTO Post SET ?;`, {
      tagId,
      title,
      description,
      banner,
    });

    conn.query(query, (err, results) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      return res.json({
        success: true,
        message: "Post created",
      });
    });
  }

  static async updatePost(req, res) {
    let postId = req.params.postId;
    let { tagId, title, description, banner, status } = req.body;

    let updateObj = {};

    if (tagId) {
      updateObj.tagId = tagId;
    }

    if (title) {
      updateObj.title = title;
    }

    if (description) {
      updateObj.description = description;
    }

    if (banner) {
      updateObj.banner = banner;
    }

    if (status) {
      updateObj.status = status;
    }

    let query = sqlString.format(`UPDATE Post SET ? WHERE postId = ?;`, [
      updateObj,
      postId,
    ]);

    conn.query(query, (err, results) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      return res.json({
        success: true,
        message: "Post updated",
      });
    });
  }
}
