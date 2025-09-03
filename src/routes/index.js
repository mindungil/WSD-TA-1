import express from "express";
import bookRoutes from "./book.routes.js";
import reviewRoutes from "./review.routes.js";
import commentRoutes from "./comment.routes.js";
import likeRoutes from "./like.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();

router.use("/books", bookRoutes);
router.use("/reviews", reviewRoutes);
router.use("/comments", commentRoutes);
router.use("/likes", likeRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/users", userRoutes);

export default router;