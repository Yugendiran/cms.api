import express from "express";

import {
  AuthController,
  PostController,
  TagController,
  CommentController,
} from "../controllers/index.js";

const router = express.Router();

router.get("/users", AuthController.getAllUsers);

router.get("/posts", PostController.getPosts);
router.get("/post/:postId", PostController.getPost);
router.post("/post/create", PostController.createPost);
router.put("/post/:postId/update", PostController.updatePost);
router.delete("/post/:postId/delete", PostController.deletePost);

router.get("/comments", CommentController.getComments);
router.put("/comment/:commentId/update", CommentController.updateComment);

router.get("/tags", TagController.getTags);
router.post("/tag/create", TagController.createTag);
router.put("/tag/:tagId/update", TagController.updateTag);
router.delete("/tag/:tagId/delete", TagController.deleteTag);

export default router;
