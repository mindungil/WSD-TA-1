import express from "express";
import * as bookCtrl from "../controllers/book.controller.js";
import reviewRouter from "./review.routes.js";

const bookRouter = express.Router();

// CSV 업로드로 도서 등록
bookRouter.post("/import/csv", bookCtrl.uploadCsvMiddleware, bookCtrl.importBooksFromCsv);

// 도서 목록 조회
bookRouter.get("/", bookCtrl.getBookList);

// isbn으로 도서 조회
bookRouter.get("/isbn/:isbn", bookCtrl.getBookToIsbn);

// 도서 단일 조회
bookRouter.get("/:bookId", bookCtrl.getBook);

// 리뷰 라우터
bookRouter.use("/:bookId/reviews", reviewRouter);

export default bookRouter;