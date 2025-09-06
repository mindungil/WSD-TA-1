import express from "express";
import bookRouter from "./book.routes.js";
import userRouter from "./user.routes.js";

const router = express.Router();

router.use("/books", bookRouter);
router.use("/users", userRouter);

export default router;