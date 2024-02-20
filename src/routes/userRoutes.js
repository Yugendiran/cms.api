import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  return res.json({
    success: true,
    message: "This is a public route.",
  });
});

router.use(authenticateToken);

router.get("/test-p", (req, res) => {
  return res.json({
    success: true,
    message: "This is a protected route.",
  });
});

router.get("/users", UserController.getUsers);

export default router;
