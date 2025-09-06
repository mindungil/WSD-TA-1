import express from "express";
import * as bookCtrl from "../controllers/book.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import libraryRouter from "./library.routes.js";
import reviewRouter from "./review.routes.js";

const bookRouter = express.Router();

// 도서 검색(카카오 API)
bookRouter.get("/search", bookCtrl.searchBook);

// 도서 목록 조회
bookRouter.get("/", bookCtrl.getBookList);

// isbn으로 도서 조회
bookRouter.get("/isbn/:isbn", bookCtrl.getBookToIsbn);

// 도서 단일 조회
bookRouter.get("/:bookId", bookCtrl.getBook);

// 리뷰 라우터
bookRouter.use("/:bookId/reviews", reviewRouter);

// 라이브러리 라우터
bookRouter.use("/:bookId/library", libraryRouter);

export default bookRouter;