import express from "express";
import * as cartCtrl from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const cartRouter = express.Router();

// 장바구니 추가
cartRouter.post("/", authMiddleware, cartCtrl.addToCart);

// 장바구니 조회
cartRouter.get("/", authMiddleware, cartCtrl.getCart);

// 장바구니 수량 수정
cartRouter.put("/:id", authMiddleware, cartCtrl.updateCartItem);

// 장바구니 항목 삭제
cartRouter.delete("/:id", authMiddleware, cartCtrl.removeFromCart);

// 장바구니 전체 비우기
cartRouter.delete("/", authMiddleware, cartCtrl.clearCart);

export default cartRouter;

