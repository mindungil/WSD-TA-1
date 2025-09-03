import express from "express";
import * as wishlistCtrl from "../controllers/wishlist.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authMiddleware, wishlistCtrl.addWishlist);
router.get("/user/:userId", wishlistCtrl.getWishlist);
router.delete("/:id", authMiddleware, wishlistCtrl.deleteWishlist);

export default router;