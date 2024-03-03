import express from "express";

import { PostController } from "../controllers/index.js";

const router = express.Router();

router.get("/posts", PostController.getPosts);
router.get("/post/:postId", PostController.getPost);
router.post("/post/create", PostController.createPost);
router.post("/post/:postId/update", PostController.updatePost);

export default router;
