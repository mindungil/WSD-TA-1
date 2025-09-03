import express from "express";
import * as reviewCtrl from "../controllers/review.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/top", reviewCtrl.top10Reviews);
router.post("/", authMiddleware, reviewCtrl.createReview);
router.put("/:id", authMiddleware, reviewCtrl.updateReview);
router.delete("/:id", authMiddleware, reviewCtrl.deleteReview);

router.get("/isbn/:isbn", reviewCtrl.getReviewsByIsbn);
router.get("/", reviewCtrl.getAllReviews);
router.get("/isbn/:isbn/:reviewId", reviewCtrl.getReviewById);

export default router;