import express from "express";
import * as reviewCtrl from "../controllers/review.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const reviewRouter = express.Router({ mergeParams: true });

// 리뷰들 조회
reviewRouter.get("/", reviewCtrl.getReviews);

// 리뷰 생성
reviewRouter.post("/", authMiddleware, reviewCtrl.createReview);

// 리뷰 수정
reviewRouter.put("/:id", authMiddleware, reviewCtrl.updateReview);

// 리뷰 삭제
reviewRouter.delete("/:id", authMiddleware, reviewCtrl.deleteReview);

export default reviewRouter;