import express from "express";
import * as commentCtrl from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const commentRouter = express.Router();

// 댓글 생성
commentRouter.post("/", authMiddleware, commentCtrl.createComment);

// 댓글 조회
commentRouter.get("/", commentCtrl.getCommentsByReview);

// 댓글 수정
commentRouter.put("/:commentId", authMiddleware, commentCtrl.updateComment);

// 댓글 삭제
commentRouter.delete("/:commentId", authMiddleware, commentCtrl.deleteComment);

export default commentRouter;