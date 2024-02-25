import express from "express";

import { authenticateToken } from "../middlewares/authMiddleware.js";

import authRoutes from "./authRoutes.js";
import platformRoutes from "./platformRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use(authenticateToken);

router.use("/platform", platformRoutes);

export default router;
