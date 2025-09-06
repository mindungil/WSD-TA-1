import express from "express";
import * as bookCtrl from "../controllers/book.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const libraryRouter = express.Router();

// 라이브러리 도서 등록
libraryRouter.post("/", authMiddleware, bookCtrl.addBookToLibrary);

// 라이브러리 도서 목록 조회
libraryRouter.get("/list", authMiddleware, bookCtrl.getLibraryList);

// 라이브러리 도서 단일 조회
libraryRouter.get("/", authMiddleware, bookCtrl.getLibraryOne);

// 라이브러리 도서 삭제
libraryRouter.delete("/:id", authMiddleware, bookCtrl.deleteLibraryItem);

export default libraryRouter;