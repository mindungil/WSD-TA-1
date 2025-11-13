import express from "express";
import * as orderCtrl from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const orderRouter = express.Router();

// 주문 생성 (장바구니에서)
orderRouter.post("/", authMiddleware, orderCtrl.createOrder);

// 주문 목록 조회
orderRouter.get("/", authMiddleware, orderCtrl.getOrders);

// 주문 상세 조회
orderRouter.get("/:id", authMiddleware, orderCtrl.getOrder);

// 주문 수정
orderRouter.put("/:id", authMiddleware, orderCtrl.updateOrder);

// 주문 취소
orderRouter.put("/:id/cancel", authMiddleware, orderCtrl.cancelOrder);

export default orderRouter;

