import express from "express";
import * as bookCtrl from "../controllers/book.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import reviewRouter from "./review.routes.js";

const bookRouter = express.Router();

// 도서 등록
bookRouter.post("/", authMiddleware, bookCtrl.createBook);

// 도서 목록 조회
bookRouter.get("/", bookCtrl.getBookList);

// 도서 단일 조회
bookRouter.get("/:bookId", bookCtrl.getBook);

// 도서 수정
bookRouter.put("/:bookId", authMiddleware, bookCtrl.updateBook);

// 리뷰 라우터
bookRouter.use("/:bookId/reviews", reviewRouter);

export default bookRouter;