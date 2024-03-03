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

  static async createTag(req, res) {
    let { tagName } = req.body;

    if (!tagName) {
      return res.json({
        success: false,
        message: "Tag name is required",
      });
    }

    let query = sqlString.format(`INSERT INTO Tag (tagName) VALUES (?)`, [
      tagName,
    ]);

    conn.query(query, (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      return res.json({
        success: true,
        message: "Tag created successfully",
      });
    });
  }

  static async updateTag(req, res) {
    let tagId = req.params.tagId;
    let { tagName, status } = req.body;

    if (!tagId) {
      return res.json({
        success: false,
        message: "Tag id is required",
      });
    }

    if (!tagName && !status) {
      return res.json({
        success: false,
        message: "Nothing to update",
      });
    }

    let updateObj = {};

    if (tagName) {
      updateObj.tagName = tagName;
    }

    if (status) {
      updateObj.status = status;
    }

    let query = sqlString.format(`UPDATE Tag SET ? WHERE tagId = ?`, [
      updateObj,
      tagId,
    ]);

    conn.query(query, (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      return res.json({
        success: true,
        message: "Tag updated successfully",
      });
    });
  }

  static async deleteTag(req, res) {
    let tagId = req.params.tagId;

    if (!tagId) {
      return res.json({
        success: false,
        message: "Tag id is required",
      });
    }

    let query = sqlString.format(
      `UPDATE Tag SET status = 'deleted' WHERE tagId = ?`,
      [tagId]
    );

    conn.query(query, (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      return res.json({
        success: true,
        message: "Tag deleted successfully",
      });
    });
  }
}
