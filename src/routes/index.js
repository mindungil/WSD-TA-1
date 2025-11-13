import express from "express";
import bookRouter from "./book.routes.js";
import userRouter from "./user.routes.js";
import cartRouter from "./cart.routes.js";
import orderRouter from "./order.routes.js";
import categoryRouter from "./category.routes.js";

const router = express.Router();

router.use("/books", bookRouter);
router.use("/users", userRouter);
router.use("/carts", cartRouter);
router.use("/orders", orderRouter);
router.use("/categories", categoryRouter);

export default router;