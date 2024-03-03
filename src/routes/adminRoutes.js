import express from "express";

import { PostController } from "../controllers/index.js";

const router = express.Router();

router.get("/posts", PostController.getPosts);

export default router;
