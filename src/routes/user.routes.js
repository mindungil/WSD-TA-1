import express from "express";
import * as userCtrl from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { getUserReviews } from "../controllers/review.controller.js";
import wishRouter from "./wishlist.routes.js";
import { getLikeReviews, getLikeComments } from "../controllers/like.controller.js";

const userRouter = express.Router();

// 회원가입 / 로그인
userRouter.post("/register", userCtrl.register);
userRouter.post("/login", userCtrl.login);

// 본인 정보 조회/수정/탈퇴
userRouter.get("/profile", authMiddleware, userCtrl.getProfile);
userRouter.put("/profile", authMiddleware, userCtrl.updateProfile);
userRouter.delete("/profile", authMiddleware, userCtrl.deleteAccount);

// 사용자의 모든 리뷰 조회
userRouter.get("/reviews", authMiddleware, getUserReviews);

// 사용자가 좋아요 한 리뷰 조회
userRouter.get("/reviews/likes", authMiddleware, getLikeReviews);

// 사용자가 좋아요 한 댓글 조회
userRouter.get("/comments/likes", authMiddleware, getLikeComments);

// 위시리스트 라우터
userRouter.use("/wishlists", wishRouter);
export default userRouter;