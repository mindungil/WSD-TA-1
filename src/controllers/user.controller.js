import User from "../models/user.model.js";
import { CustomError } from "../utils/CustomError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import Review from "../models/review.model.js";
import { generateAccessToken, generateRefreshToken, saveRefreshToken, deleteRefreshToken } from "./tokenService.js";

dotenv.config();

// 회원가입
export async function register(req, res, next) {
  try {
    const { nickname, email, password } = req.body;
    if (!nickname || !email || !password) throw new CustomError("모든 필드를 입력하세요.", 400);

    const existing = await User.findOne({ email });
    if (existing) throw new CustomError("이미 가입된 이메일입니다.", 409);

    const hashSalt = parseInt(process.env.BCRYPT_SALT_ROUNDS);
    const hashPassword = await bcrypt.hash(password, hashSalt);
    const user = await User.create({ nickname, email, password: hashPassword });

    res.status(201).json({ success: true, data: { user: { id: user._id, nickname, email } } });
  } catch (err) {
    next(err);
  }
}

// 로그인
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new CustomError("이메일과 비밀번호를 입력하세요.", 400);

    const user = await User.findOne({ email });
    if (!user) throw new CustomError("가입되지 않은 이메일입니다.", 404);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new CustomError("비밀번호가 일치하지 않습니다.", 401);

    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await saveRefreshToken(user._id, refreshToken);
    
    res.json({ success: true, data: { user: { id: user._id, nickname: user.nickname, email }, accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
}

// 로그아웃
export async function logout(req, res, next) {
  try {
    const userId = req.user._id;
    await deleteRefreshToken(userId);
    res.json({ success: true });
  } catch(err) {
    next(err);
  }

}

// 회원 정보 조회
export async function getProfile(req, res, next) {
  try {
    const user = req.user;
    res.json({ success: true, data: { id: user._id, nickname: user.nickname, email: user.email } });
  } catch (err) {
    next(err);
  }
}

// 회원 정보 수정
export async function updateProfile(req, res, next) {
  try {
    const user = req.user;
    const { nickname, password } = req.body;

    if (nickname) user.nickname = nickname;
    if (password) user.password = password;

    await user.save();
    res.json({ success: true, data: { id: user._id, nickname: user.nickname, email: user.email } });
  } catch (err) {
    next(err);
  }
}

// 회원 탈퇴
export async function deleteAccount(req, res, next) {
  try {
    const user = req.user;
    await user.remove();
    res.json({ success: true, message: "회원 탈퇴 완료" });
  } catch (err) {
    next(err);
  }
}