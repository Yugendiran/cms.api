import express from "express";
import { AuthController } from "../controllers/index.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/admin-login", AuthController.adminLogin);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/validate-otp", AuthController.validateOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/forgot-password", AuthController.forgotPassword);

router.use(authenticateToken);

router.post("/reset-password", AuthController.resetPassword);

export default router;
