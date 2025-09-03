import express from "express";
import * as commentCtrl from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/:reviewId", authMiddleware, commentCtrl.createComment);
router.get("/:reviewId", commentCtrl.getCommentsByReview);
router.put("/edit/:id", authMiddleware, commentCtrl.updateComment);
router.delete("/delete/:id", authMiddleware, commentCtrl.deleteComment);

export default router;