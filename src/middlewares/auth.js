import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { CustomError } from "../utils/CustomError.js";

export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new CustomError("인증 토큰이 없습니다.", 401);
    }
    const token = header.split(" ")[1];
    
    let payload;
    try {
      payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (jwtError) {
      // JWT 에러는 에러 핸들러에서 처리하도록 그대로 전달
      return next(jwtError);
    }

    if (!payload.userId || typeof payload.userId !== 'number' && typeof payload.userId !== 'string') {
      throw new CustomError("유효하지 않은 토큰입니다.", 401);
    }

    const user = await User.findByPk(payload.userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) throw new CustomError("유효하지 않은 토큰입니다.", 401);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}