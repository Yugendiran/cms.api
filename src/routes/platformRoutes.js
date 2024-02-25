import express from "express";
import { PostController, TagController } from "../controllers/index.js";

const router = express.Router();

// Posts
router.get("/posts", PostController.getPosts);
router.get("/posts/:postId", PostController.getPost);

// Tags
router.get("/tags", TagController.getTags);

export default router;
