import express from "express";
import * as categoryCtrl from "../controllers/category.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const categoryRouter = express.Router();

// 카테고리 목록 조회
categoryRouter.get("/", categoryCtrl.getCategories);

// 카테고리별 도서 조회
categoryRouter.get("/:categoryId/books", categoryCtrl.getBooksByCategory);

// 카테고리 생성
categoryRouter.post("/", authMiddleware, categoryCtrl.createCategory);

// 카테고리 수정
categoryRouter.put("/:categoryId", authMiddleware, categoryCtrl.updateCategory);

export default categoryRouter;

