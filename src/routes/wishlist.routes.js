import express from "express";
import * as wishlistCtrl from "../controllers/wishlist.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const wishRouter = express.Router();

// 위시르스트 동록
wishRouter.post("/", authMiddleware, wishlistCtrl.addWishlist);

// 위시리스트 조회
wishRouter.get("/", authMiddleware, wishlistCtrl.getWishlist);

// 위시리스트 삭제
wishRouter.delete("/:id", authMiddleware, wishlistCtrl.deleteWishlist);

export default wishRouter;