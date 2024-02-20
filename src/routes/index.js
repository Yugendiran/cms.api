import express from "express";

import auth from "./authRoutes.js";
import user from "./userRoutes.js";

const router = express.Router();

router.use("/auth", auth);
router.use("/user", user);

export default router;
