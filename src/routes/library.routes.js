import express from "express";
import * as libCtrl from "../controllers/library.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const libraryRouter = express.Router({ mergeParams: true });

// 라이브러리 도서 등록
libraryRouter.post("/", authMiddleware, libCtrl.addBookToLibrary);

// 라이브러리 도서 목록 조회
libraryRouter.get("/list", authMiddleware, libCtrl.getLibraryList);

// 라이브러리 도서 단일 조회
libraryRouter.get("/", authMiddleware, libCtrl.getLibraryOne);

// 라이브러리 도서 삭제
libraryRouter.delete("/:id", authMiddleware, libCtrl.deleteLibraryItem);

export default libraryRouter;