import jwt from "jsonwebtoken";
import { getRedis } from "../config/redis.config.js";

const ACCESS_TOKEN_EXPIRE = "1h";
const REFRESH_TOKEN_EXPIRE_SEC = 604800; // 7일

// refresh token을 통해 새 access token 발급
export async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const stored = await getRefreshToken(payload.userId);
    if (!stored || stored !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({ userId: payload.userId });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
}

// access token 생성
export function generateAccessToken(user) {
  // user 객체가 {_id} 또는 {userId} 형태 모두 올 수 있도록 대응
  const userId = (user && (user._id || user.userId)) || user;
  return jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRE }
  );
}

// refersh token 생성
export function generateRefreshToken(user) {
  const userId = (user && (user.id || user.userId)) || user;
  return jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRE_SEC } // JWT 자체 만료도 설정
  );
}

// refresh token을 redis에 저장
export async function saveRefreshToken(userId, refreshToken) {
  const redis = getRedis();
  await redis.set(`refresh:${userId}`, refreshToken, {
    EX: REFRESH_TOKEN_EXPIRE_SEC,
  });
}

// redis에서 refresh token 조회
export async function getRefreshToken(userId) {
  const redis = getRedis();
  return await redis.get(`refresh:${userId}`);
}

// refresh token 삭제 (로그아웃 시)
export async function deleteRefreshToken(userId) {
  const redis = getRedis();
  await redis.del(`refresh:${userId}`);
}
