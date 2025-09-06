import express from "express";
import * as commentCtrl from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { likeComment, unlikeComment } from "../controllers/like.controller.js";

const commentRouter = express.Router({ mergeParams: true });

// 댓글 생성
commentRouter.post("/", authMiddleware, commentCtrl.createComment);

// 댓글 조회
commentRouter.get("/", commentCtrl.getCommentsByReview);

// 댓글 수정
commentRouter.put("/:commentId", authMiddleware, commentCtrl.updateComment);

// 댓글 삭제
commentRouter.delete("/:commentId", authMiddleware, commentCtrl.deleteComment);

// 댓글 좋아요
commentRouter.post("/:commentId/like", authMiddleware, likeComment);
commentRouter.delete("/:commentId/like", authMiddleware, unlikeComment);

export default commentRouter;