// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.json({
      success: false,
      message: "No token provided",
      login: false,
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
    if (err) {
      return res.json({
        success: false,
        message: "Invalid token",
        login: false,
      });
    }

    req.user = result;

    next();
  });
}

export { authenticateToken };
