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

export class CommentController {
  static async getComments(req, res) {
    let { postId, userId, status, orderBy, sortBy } = req.query;

    if (req.user.role == "user") {
      if (!postId) {
        return res.json({
          success: false,
          message: "postId is required",
        });
      }
    }

    let offset = Number(req.query.offset);
    let limit = Number(req.query.limit);
    offset = offset * limit;

    let whereQuery = " WHERE 1 = 1 ";

    if (postId) {
      whereQuery += ` AND postId = ${postId} `;
    }

    if (userId) {
      whereQuery += ` AND userId = ${userId} `;
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

    let query = sqlString.format(
      `SELECT *,
        (SELECT name FROM User WHERE userId = Comment.userId) AS userName
       FROM Comment ${whereQuery} ${orderByQuery}`
    );

    if (!isNaN(offset) && !isNaN(limit) && offset >= 0 && limit >= 0) {
      query += sqlString.format(` LIMIT ?, ?;`, [offset, limit]);
    } else {
      query += ";";
    }

    query += sqlString.format(
      `SELECT COUNT(*) AS totalRecords FROM Comment ${whereQuery};`
    );

    conn.query(query, (err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message,
        });
      }

      let comments = result[0];

      let pageMeta = {
        totalRecords: result[1][0].totalRecords,
      };

      if (!isNaN(offset) && !isNaN(limit) && offset >= 0 && limit >= 0) {
        pageMeta.noOfPages = Math.ceil(pageMeta.totalRecords / limit);
      } else {
        pageMeta.noOfPages = 1;
      }

      return res.json({
        success: true,
        comments,
        pageMeta,
      });
    });
  }

  static async addComment(req, res) {
    let { postId, comment } = req.body;

    if (!postId || !comment) {
      return res.json({
        success: false,
        message: "postId and comment are required",
      });
    }

    let query = sqlString.format(`INSERT INTO Comment SET ?;`, [
      {
        postId,
        userId: req.user.userId,
        text: comment,
      },
    ]);

    conn.query(query, (err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message,
        });
      }

      return res.json({
        success: true,
        message: "Comment added successfully",
      });
    });
  }

  static async updateComment(req, res) {
    let commentId = req.params.commentId;
    let { status } = req.body;

    if (!commentId) {
      return res.json({
        success: false,
        message: "commentId is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required",
      });
    }

    let query = sqlString.format(`UPDATE Comment SET ? WHERE commentId = ?;`, [
      {
        status,
      },
      commentId,
    ]);

    conn.query(query, (err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message,
        });
      }

      return res.json({
        success: true,
        message: "Comment updated successfully",
      });
    });
  }
}
