import express from "express";
import bookRouter from "./book.routes.js";
import reviewRouter from "./review.routes.js";
import likeRouter from "./reviewLike.routes.js";
import wishlistRouter from "./wishlist.routes.js";
import userRouter from "./user.routes.js";
import libraryRouter from "./library.routes.js";
import Review from "../models/review.model.js";

const router = express.Router();

router.use("/books", bookRouter);
router.use("/users", userRouter);

export default router;