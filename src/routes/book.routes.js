import express from "express";
import * as bookCtrl from "../controllers/book.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/search", bookCtrl.searchExternalBooks);
router.post("/library", authMiddleware, bookCtrl.addBookToLibrary);
router.get("/library/user/:userId", bookCtrl.getLibraryByUser);
router.get("/library/:userId/:id", bookCtrl.getLibraryItem);
router.delete("/library/:id", authMiddleware, bookCtrl.deleteLibraryItem);

export default router;