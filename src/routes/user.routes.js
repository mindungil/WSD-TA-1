import express from "express";
import * as userCtrl from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// 회원가입 / 로그인
router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);

// 본인 정보 조회/수정/탈퇴
router.get("/me", authMiddleware, userCtrl.getProfile);
router.put("/me", authMiddleware, userCtrl.updateProfile);
router.delete("/me", authMiddleware, userCtrl.deleteAccount);

export default router;