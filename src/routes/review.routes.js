import express from "express";
import * as likeCtrl from "../controllers/like.controller.js";
import * as reviewCtrl from "../controllers/review.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const reviewRouter = express.Router();

// 리뷰 좋아요 등록
reviewRouter.post("/:reviewId", authMiddleware, likeCtrl.likeReview);

// 리뷰들 조회
reviewRouter.get("/", reviewCtrl.getReviews);

// 리뷰 생성
reviewRouter.post("/", authMiddleware, reviewCtrl.createReview);

// 리뷰 수정
reviewRouter.put("/:id", authMiddleware, reviewCtrl.updateReview);

// 리뷰 삭제
reviewRouter.delete("/:id", authMiddleware, reviewCtrl.deleteReview);

// 댓글 라우터
reviewRouter.get("/:reviewId/comments", commentRouter);

export default reviewRouter;