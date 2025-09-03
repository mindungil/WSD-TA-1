import express from "express";
import * as likeCtrl from "../controllers/reviewLike.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/:reviewId", authMiddleware, likeCtrl.likeReview);
router.delete("/:reviewId", authMiddleware, likeCtrl.unlikeReview);
router.get("/user/:userId", likeCtrl.getLikesByUser);

export default router;