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

export class TagController {
  static async getTags(req, res) {
    let { keyword, status, orderBy, sortBy } = req.query;

    let offset = Number(req.query.offset);
    let limit = Number(req.query.limit);
    offset = offset * limit;

    let whereQuery = " WHERE 1 = 1 ";

    if (keyword) {
      whereQuery += ` AND tagName LIKE '%${keyword}%' `;
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
        (SELECT COUNT(*) FROM Post WHERE tagId = Tag.tagId) AS totalPosts
       FROM Tag ${whereQuery} ${orderByQuery}`
    );

    if (!isNaN(offset) && !isNaN(limit) && offset >= 0 && limit >= 0) {
      query += sqlString.format(` LIMIT ?, ?;`, [offset, limit]);
    } else {
      query += ";";
    }

    query += sqlString.format(
      `SELECT COUNT(*) AS totalRecords FROM Tag ${whereQuery};`
    );

    conn.query(query, (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      let tags = result[0];

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
        tags,
        pageMeta,
      });
    });
  }
}
