import express from "express";
import {
  PostController,
  TagController,
  CommentController,
} from "../controllers/index.js";

const router = express.Router();

// Posts
router.get("/posts", PostController.getPosts);
router.get("/posts/:postId", PostController.getPost);
router.post("/posts/:postId/like", PostController.likePost);

// Comments
router.get("/comments", CommentController.getComments);
router.post("/comments", CommentController.addComment);

// Tags
router.get("/tags", TagController.getTags);

export default router;
