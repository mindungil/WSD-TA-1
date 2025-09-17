import Review from "../models/review.model.js";
import Book from "../models/book.model.js";
import { getPagination } from "../utils/paginate.js";
import { CustomError } from "../utils/CustomError.js";
import { getRedis } from "../config/redis.config.js";

// 좋아요 상위 10개 리뷰(redis 캐싱, 페이지)
export async function getReviews(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req);
    const { bookId } = req.params;

    // 페이지 단위 캐시 키 생성
    // 버전 키를 사용해 대량 무효화 비용을 줄임
    const version = (await getRedis().get("reviews:top:version")) || "0";
    const cacheKey = `reviews:top:v:${version}:book:${bookId || 'all'}:page:${page}:limit:${limit}`;
    const cached = await getRedis().get(cacheKey);

    if (cached) {
      return res.json({ success: true, source: "cache", data: JSON.parse(cached) });
    }

    // DB 조회
    const filter = { status: "ACTIVE", ...(bookId ? { bookId } : {}) };
    const reviews = await Review.find(filter)
      .sort({ likes: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "nickname")
      .lean();

    // 캐시 저장 (예: 60초)
    await getRedis().set(cacheKey, JSON.stringify(reviews), { EX: 60 });

    res.json({ success: true, source: "db", data: reviews, pagination: { page, limit } });
  } catch (err) {
    next(err);
  }
}


// 리뷰 생성
export async function createReview(req, res, next) {
  try {
    const bookId = req.params.bookId;
    const { title, content, rating } = req.body;
    if (!bookId || !content) throw new CustomError("book 식별자와 내용이 필요합니다.", 400);

    // 책이 DB에 있으면 참조, 없으면 생성(선택사항)
    let book = await Book.findById(bookId);
    if(!book) {
      throw new CustomError('책 정보가 없습니다.', 404);
    }

    const review = await Review.create({ userId: req.user._id, bookId: book._id, title, content, rating });
    // Book 집계 업데이트
    if (typeof rating === "number") {
      const incReviewCount = 1;
      // 가중 평균 업데이트: avg' = (avg * n + r) / (n + 1)
      await Book.updateOne(
        { _id: book._id },
        [
          {
            $set: {
              reviewCount: { $add: ["$reviewCount", incReviewCount] },
              averageRating: {
                $cond: [
                  { $gt: ["$reviewCount", 0] },
                  { $divide: [ { $add: [ { $multiply: ["$averageRating", "$reviewCount"] }, rating ] }, { $add: ["$reviewCount", incReviewCount] } ] },
                  rating
                ]
              }
            }
          }
        ]
      );
    }

    // 캐시 무효화 - 모든 페이지 캐시 삭제
    try {
      await getRedis().incr("reviews:top:version");
    } catch (cacheError) {
      console.error("캐시 무효화 실패:", cacheError);
      // 캐시 오류는 무시하고 계속 진행
    }

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

// 리뷰 수정
export async function updateReview(req, res, next) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) throw new CustomError("리뷰를 찾을 수 없습니다.", 404);
    if (!review.userId.equals(req.user._id)) throw new CustomError("권한이 없습니다.", 403);

    const oldRating = review.rating;
    const allowed = ["title", "content", "rating"];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) review[k] = req.body[k];
    });

    await review.save();
    // Book 집계 업데이트 (rating 변경 시)
    if (typeof req.body.rating === "number" && req.body.rating !== oldRating) {
      const delta = req.body.rating - (oldRating || 0);
      await Book.updateOne(
        { _id: review.bookId },
        [
          {
            $set: {
              averageRating: {
                $cond: [
                  { $gt: ["$reviewCount", 0] },
                  { $divide: [ { $add: [ { $multiply: ["$averageRating", "$reviewCount"] }, delta ] }, "$reviewCount" ] },
                  req.body.rating
                ]
              }
            }
          }
        ]
      );
    }
    // 캐시 무효화 - 모든 페이지 캐시 삭제
    try {
      await getRedis().incr("reviews:top:version");
    } catch (cacheError) {
      console.error("캐시 무효화 실패:", cacheError);
      // 캐시 오류는 무시하고 계속 진행
    }
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

// 리뷰 삭제
export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) throw new CustomError("리뷰를 찾을 수 없습니다.", 404);
    if (!review.userId.equals(req.user._id)) throw new CustomError("권한이 없습니다.", 403);

    review.status = "DELETED";
    await review.save();
    // Book 집계 업데이트 (DELETED 처리 시 평균/카운트 보정)
    if (typeof review.rating === "number") {
      await Book.updateOne(
        { _id: review.bookId },
        [
          {
            $set: {
              reviewCount: { $max: [0, { $subtract: ["$reviewCount", 1] }] },
              averageRating: {
                $cond: [
                  { $gt: [ { $subtract: ["$reviewCount", 1] }, 0 ] },
                  { $divide: [ { $subtract: [ { $multiply: ["$averageRating", "$reviewCount"] }, review.rating ] }, { $subtract: ["$reviewCount", 1] } ] },
                  0
                ]
              }
            }
          }
        ]
      );
    }
    
    // 캐시 무효화 - 모든 페이지 캐시 삭제
    try {
      await getRedis().incr("reviews:top:version");
    } catch (cacheError) {
      console.error("캐시 무효화 실패:", cacheError);
      // 캐시 오류는 무시하고 계속 진행
    }
    res.json({ success: true, message: "삭제되었습니다." });
  } catch (err) {
    next(err);
  }
}

// 사용자의 리뷰 전체 조회(페이지)
export async function getUserReviews(req, res, next) {
  try {
    const userId = req.user._id;
    const { page, limit, skip, sort } = getPagination(req);
    const reviews = await Review.find({ userId, status: "ACTIVE" })
      .sort(sort)        
      .skip(skip)        
      .limit(limit)      
      .lean();           

    res.json({ success: true, data: reviews, pagination: { page, limit } });
  } catch (err) {
    next(err);
  }
}